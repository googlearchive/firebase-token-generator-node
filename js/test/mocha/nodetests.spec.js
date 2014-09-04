var assert = require("assert");
var FirebaseTokenGenerator = require("../../../dist/firebase-token-generator-node.js");

function _decodeJWTPart(part) {
  return JSON.parse(new Buffer(part.replace("-", "+").replace("_", "/"), "base64").toString());
}

describe("FirebaseTokenGenerator", function() {
  
  var obj = new FirebaseTokenGenerator("omgsekrit");

  it("should construct a valid FirebaseTokenGenerator object", function() {
    assert.equal(typeof obj, typeof {});
    assert.equal(obj.mSecret, "omgsekrit");
  });

  it("should return something that looks like a JWT with no arguments", function() {
    var token = obj.createToken({
      'blah': 5,
      'uid': 'blah'
    });
    var parts = token.split(".");
    var header = _decodeJWTPart(parts[0]);
    assert.equal(typeof token, typeof "");
    assert.equal(parts.length, 3);
    assert.equal(header.typ, "JWT");
    assert.equal(header.alg, "HS256");
  });

  it("should accept iat in options", function() {
    var iat = 1365028233;
    var token = obj.createToken({uid: 'bar'}, {iat: iat});
    assert.equal(token, "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjEzNjUwMjgyMzMsInYiOjAsImQiOnsidWlkIjoiYmFyIn19.6CsfeobxRCRd65pYddGjyeN2fh6sWvIRob1866VqDNI");
  });

  it("should preserve all provided options", function() {
    var iat = Math.round(new Date().getTime());
    var expires = iat + 1000;
    var notBefore = iat + 10;

    var token = obj.createToken({foo: "bar", uid: 'blah'}, {
      iat: iat, expires: expires, notBefore: notBefore, admin: false, debug: true
    });

    var body = _decodeJWTPart(token.split(".")[1]);
    assert.equal(body.iat, iat);
    assert.equal(body.exp, expires);
    assert.equal(body.nbf, notBefore);
    assert.equal(body.admin, false);
    assert.equal(body.debug, true);
    assert.equal(body.d.foo, "bar");
  });

  it("should support native Date objects", function() {
    var expires = new Date();
    var notBefore = new Date();
    var token = obj.createToken({ "uid": "1" }, {expires: expires, notBefore: notBefore});

    var body = _decodeJWTPart(token.split(".")[1]);
    assert.equal(body.exp, Math.round(expires.getTime() / 1000));
    assert.equal(body.nbf, Math.round(notBefore.getTime() / 1000));
  });
});
