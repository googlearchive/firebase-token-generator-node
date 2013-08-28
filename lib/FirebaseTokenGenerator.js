var crypto = require('crypto');

/** @const */ var TOKEN_SEP = ".";
/** @const */ var TOKEN_VERSION = 0;


/**
 * Builds a new object that can generate Firebase authentication tokens.
 * @constructor
 * @export
 * @param {String} secret The secret for the Firebase being used (get yours from the Firebase Admin Console).
 */
FirebaseTokenGenerator = function(secret) {
  this.mSecret = secret;
};


/**
 * Creates a token that authenticates a client with arbitrary data "data", and the specified options.
 *
 * @export
 * @param {Object} data Arbitrary JSON data that will be passed to the Firebase Rules API, once a client authenticates.
 * @param {Object} options The developer-supplied options for this token. Supported options are:
 *                a) "expires" -- (Number) A timestamp (as a number of seconds since the epoch) denoting a time after which
 *                          this token should no longer be valid.
 *                b) "notBefore" -- (Number) A timestamp (as a number of seconds since the epoch) denoting a time before
 *                          which this token should be rejected by the server.
 *                c) "admin" -- (Boolean) Set to true to bypass all security rules (use this for your trusted servers).
 *                d) "debug" -- (Boolean) Set to true to enable debug mode (so you can see the results of Rules API operations)
 *                e) "simulate" -- (Boolean) (internal-only for now) Set to true to neuter all API operations (listens / puts
 *                                 will run security rules but not actually write or return data)
 *                f) "iat" -- (Number) (internal-only, for testing) Set the issued at time for the generated token
 * @return {String} The authentication token
 */
FirebaseTokenGenerator.prototype.createToken = function(data, options) {
  var funcName = 'FirebaseTokenGenerator.createToken';
  options = options || { };
  if (FirebaseTokenGenerator.isEmptyObject_(data) && FirebaseTokenGenerator.isEmptyObject_(options)) {
    throw new Error(funcName + ": data is empty and no options are set.  This token will have no effect on Firebase.");
  }

  var claims = this.createOptionsClaims(funcName, options);
  claims["v"] = TOKEN_VERSION;
  claims["d"] = data;

  if (!claims["iat"]) {
    claims["iat"] = Math.floor(new Date().getTime() / 1000);
  }

  return this.createToken_(claims);
};


/**
 * Take the options supplied on the public API and turn them into claims we can put in the token.
 * @param opts The developer-supplied options for this token.
 * @return The resulting options dictionary to include in the token.
 */
FirebaseTokenGenerator.prototype.createOptionsClaims = function(func_name, opts) {

  var claims = {};

  for (var o in opts) {
    if (opts.hasOwnProperty(o)) {
      switch (o) {
        case "expires":
        case "notBefore":
          var code = (o == "notBefore" ? "nbf" : "exp");
          if (opts[o] instanceof Date) {
            claims[code] = Math.round(opts[o].getTime() / 1000);
          } else {
            claims[code] = opts[o];
          }
          break;
        case "admin" :
          claims["admin"] = opts[o];
          break;
        case "debug" :
          claims["debug"] = opts[o];
          break;
        case "simulate" :
          claims["simulate"] = opts[o];
          break;
        case "iat":
          claims["iat"] = opts[o];
          break;
        default: {
          throw new Error(func_name + " unrecognized option: " + o);
        }
      }
    }
  }

  return claims;
};


/**
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
 * @param {Object} claims A JSON object containing the security payload of this token (see "claims" above).
 * @return {String} The authentication token.
 */
FirebaseTokenGenerator.prototype.createToken_ = function(claims) {

  //set up the header
  var headerData = {"typ": "JWT", "alg":"HS256"};

  //encode the header and payload
  var encodedHeader = this.noPadWebsafeBase64Encode_(JSON.stringify(headerData));
  var encodedClaims = this.noPadWebsafeBase64Encode_(JSON.stringify(claims));

  //generate the signature
  var secureBits = encodedHeader + TOKEN_SEP + encodedClaims;
  var hmac = crypto.createHmac('sha256', this.mSecret);
  hmac.update(secureBits);
  var hashBytes = hmac.digest('binary');
  var sig = this.noPadWebsafeBase64Encode_(hashBytes, 'binary');
  return encodedHeader + TOKEN_SEP + encodedClaims + TOKEN_SEP + sig;
};


/**
 * Base64 encodes a string with a URL-safe encoding with no padding characters.
 *
 * @param {String} str The string to encode
 * @param {String=} encoding optional encoding the of the string
 * @return {String} The base64 encoded version
 */
FirebaseTokenGenerator.prototype.noPadWebsafeBase64Encode_ = function(str, encoding) {
  var encoded = new Buffer(str, encoding).toString('base64');
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

FirebaseTokenGenerator.isEmptyObject_ = function(obj) {
  if (typeof obj !== 'object')
    return false;
  if (obj === null) 
    return true;
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
};


// For the node client, we need to export our self.
module['exports'] = FirebaseTokenGenerator;
