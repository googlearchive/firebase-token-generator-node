goog.provide('FirebaseTokenGenerator');
goog.require('CryptoJS');
goog.require('fb.tokengenerator.constants');
goog.require('fb.tokengenerator.json');
goog.require('fb.tokengenerator.utf8');
goog.require('fb.tokengenerator.validation');
goog.require('goog.crypt.base64');


/** @const */ var TOKEN_SEP = '.';
/** @const */ var TOKEN_VERSION = 0;


/**
 * Builds a new object that can generate Firebase authentication tokens.
 * @constructor
 * @export
 * @param { String } secret The secret for the Firebase being used (get yours from the Firebase Admin Console).
 */
var FirebaseTokenGenerator = function(secret) {
  fb.tokengenerator.validation.validateArgCount('new FirebaseTokenGenerator', 1, 1, arguments.length);
  fb.tokengenerator.validation.validateSecret('new FirebaseTokenGenerator', 1, secret);
  this.mSecret = secret;
};


/**
 * Creates a token that authenticates a client with arbitrary data "data", and the specified options.
 *
 * @export
 * @param { Object } data JSON data that will be passed to the Firebase Rules API once a client authenticates. Unless the
 *                "admin" flag is set, it must contain a "uid" key, and if it does it must be a string of length
 *                256 or less.
 * @param { Object } options The developer-supplied options for this token. Supported options are:
 *                a) "expires" -- A timestamp (as a number of seconds since the epoch) denoting a time after which
 *                          this token should no longer be valid.
 *                b) "notBefore" -- A timestamp (as a number of seconds since the epoch) denoting a time before
 *                          which this token should be rejected by the server.
 *                c) "admin" -- Set to true to bypass all security rules (use this for your trusted servers).
 *                d) "debug" -- Set to true to enable debug mode (so you can see the results of Rules API operations)
 *                e) "simulate" -- (internal-only for now) Set to true to neuter all API operations (listens / puts
 *                                 will run security rules but not actually write or return data)
 *                f) "iat" -- (Number) (internal-only, for testing) Set the issued at time for the generated token
 * @return {String} The authentication token
 */
FirebaseTokenGenerator.prototype.createToken = function(data, options) {
  var funcName = 'FirebaseTokenGenerator.createToken';
  fb.tokengenerator.validation.validateArgCount(funcName, 1, 2, arguments.length);
  fb.tokengenerator.validation.validateCredentialOptions(funcName, 2, options);

  options = options || {};
  fb.tokengenerator.validation.validateCredentialData(funcName, 1, data, options['admin'] === true);

  if (FirebaseTokenGenerator.isEmptyObject_(data) && FirebaseTokenGenerator.isUselessOptionsObject_(options)) {
    throw new Error(funcName + ': data is empty and no options are set.  This token will have no effect on Firebase.');
  }

  var claims = this.createOptionsClaims(funcName, options);
  claims['v'] = TOKEN_VERSION;
  claims['d'] = data;

  if (!claims['iat']) {
    claims['iat'] = Math.floor(new Date().getTime() / 1000);
  }

  return this.createToken_(claims);
};


/**
 * Take the options supplied on the public API and turn them into claims we can put in the token.
 * @param { String } func_name The name of the calling function.
 * @param { Object } opts The developer-supplied options for this token.
 * @return { Object } The resulting options dictionary to include in the token.
 */
FirebaseTokenGenerator.prototype.createOptionsClaims = function(func_name, opts) {

  var claims = {};

  for (var o in opts) {
    switch (o) {
      case 'expires':
      case 'notBefore':
        var code = (o === 'notBefore' ? 'nbf' : 'exp');
        if (opts[o] instanceof Date) {
          claims[code] = Math.round(opts[o].getTime() / 1000);
        } else {
          fb.tokengenerator.validation.validateOption(func_name, o, opts[o], 'number', 'a number');
          claims[code] = opts[o];
        }
        break;
      case 'admin' :
        fb.tokengenerator.validation.validateOption(func_name, o, opts[o], 'boolean', 'a boolean');
        claims['admin'] = opts[o];
        break;
      case 'debug' :
        fb.tokengenerator.validation.validateOption(func_name, o, opts[o], 'boolean', 'a boolean');
        claims['debug'] = opts[o];
        break;
      case 'simulate' :
        fb.tokengenerator.validation.validateOption(func_name, o, opts[o], 'boolean', 'a boolean');
        claims['simulate'] = opts[o];
        break;
      case 'iat':
        fb.tokengenerator.validation.validateOption(func_name, o, opts[o], 'number', 'a number');
        claims['iat'] = opts[o];
        break;
      default: {
        throw new Error(func_name + ': unrecognized \"' + o + '\" option');
      }
    }
  }

  return claims;
};


/**
 * @private
 * Generates a secure authentication token.
 *
 * Our token format follows the JSON Web Token (JWT) standard:
 * header.claims.signature
 *
 * Where:
 * 1) "header" is a stringified, base64-encoded JSON object containing version and algorithm information.
 * 2) "claims" is a stringified, base64-encoded JSON object containing a set of claims:
 *    Library-generated claims:
 *    "iat" -> The issued at time in seconds since the epoch as a number
 *    "d" -> The arbitrary JSON object supplied by the user.
 *    User-supplied claims (these are all optional):
 *    "exp" (optional) -> The expiration time of this token, as a number of seconds since the epoch.
 *    "nbf" (optional) -> The "not before" time before which the token should be rejected (seconds since the epoch)
 *    "admin" (optional) -> If set to true, this client will bypass all security rules (use this to authenticate servers)
 *    "debug" (optional) -> "set to true to make this client receive debug information about security rule execution.
 *    "simulate" (optional, internal-only for now) -> Set to true to neuter all API operations (listens / puts
 *               will run security rules but not actually write or return data).
 * 3) A signature that proves the validity of this token (see: http://tools.ietf.org/html/draft-ietf-jose-json-web-signature-07)
 *
 * For base64-encoding we use URL-safe base64 encoding. This ensures that the entire token is URL-safe
 * and could, for instance, be placed as a query argument without any encoding (and this is what the JWT spec requires).
 *
 * @param { Object } claims A JSON object containing the security payload of this token (see "claims" above).
 * @return {String} The authentication token.
 */
FirebaseTokenGenerator.prototype.createToken_ = function(claims) {

  //set up the header
  var headerData = {'typ': 'JWT', 'alg': 'HS256'};

  //encode the header and payload
  var encodedHeader = this.noPadWebsafeBase64Encode_(fb.tokengenerator.json.stringify(headerData));
  var encodedClaims = this.noPadWebsafeBase64Encode_(fb.tokengenerator.json.stringify(claims));

  //generate the signature
  var secureBits = encodedHeader + TOKEN_SEP + encodedClaims;
  var hashHex = CryptoJS.HmacSHA256(secureBits, this.mSecret).toString();
  var hashBytes = this.hexToBytes_(hashHex);
  var sig = goog.crypt.base64.encodeByteArray(hashBytes, /*useWebSafe=*/true);
  sig = this.removeBase64Pad_(sig);
  var token = encodedHeader + TOKEN_SEP + encodedClaims + TOKEN_SEP + sig;

  fb.tokengenerator.validation.validateGeneratedToken(token);

  return token;
};


/**
 * @private
 * Base64 encodes a string with a URL-safe encoding with no padding characters.
 *
 * @param {String} str The string to encode
 * @return {String} The base64 encoded version
 */
FirebaseTokenGenerator.prototype.noPadWebsafeBase64Encode_ = function(str) {
  var utf8Bytes = fb.tokengenerator.utf8.stringToByteArray(str);
  var base64String = goog.crypt.base64.encodeByteArray(utf8Bytes, /*useWebSafe=*/true);
  return this.removeBase64Pad_(base64String);
};


/**
 * Strips the padding from a base64 encoding to match the JWT spec.
 *
 * @param { String } str
 * @return {*}
 * @private
 */
FirebaseTokenGenerator.prototype.removeBase64Pad_ = function(str) {
  var padStart = str.indexOf('.');
  if (padStart >= 0) {
    return str.substring(0, padStart);
  } else {
    return str;
  }
};

/**
 * @private
 * Convert a hex string into a byte array
 * @param { String } hex
 * @return {Array}
 */
FirebaseTokenGenerator.prototype.hexToBytes_ = function(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
};

/**
 * @private
 * Determine whether an Object is empty
 * @param { Object } obj
 * @return { Boolean }
 */
FirebaseTokenGenerator.isEmptyObject_ = function(obj) {
  if (typeof obj !== 'object') {
    return false;
  }
  if (obj === null) {
    return true;
  }
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
};

/**
 * @private
 * Determine whether an Object contains any useful attributes
 * @param { Object } obj
 * @return { Boolean }
 */
FirebaseTokenGenerator.isUselessOptionsObject_ = function(obj) {

  function containsUsefulKeys(obj) {
    var usefulKeys = ['admin', 'debug', 'simulate'];
    for (var i in usefulKeys) {
      var key = usefulKeys[i];
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return true;
      }
    }
    return false;
  }

  return FirebaseTokenGenerator.isEmptyObject_(obj) || !containsUsefulKeys(obj);
};

// For the node client, we need to export our self.
if (NODE_CLIENT) {
  module['exports'] = FirebaseTokenGenerator;
}
