
var assert = require("assert");
var tokenGen = require("../lib/FirebaseTokenGenerator.js");

describe("FirebaseTokenGenerator", function() {
  
  var obj = new FirebaseTokenGenerator("omgsekrit");

  it("should construct a valid FirebaseTokenGenerator object", function() {
    assert.equal(typeof obj, typeof {});
    assert.equal(obj.mSecret, "omgsekrit");
  });

  it("should return something that looks like a JWT with no arguments", function() {
    var token = obj.createToken();
    var parts = token.split(".");
    var header = parts[0].replace("-", "+").replace("_", "/");
    header = JSON.parse(new Buffer(header, "base64").toString());
    assert.equal(typeof token, typeof "");
    assert.equal(parts.length, 3);
    assert.equal(header.typ, "JWT");
    assert.equal(header.alg, "HS256");
  });

  it("should accept iat in options", function() {
    var iat = 1365028233;
    var token = obj.createToken(null, {iat: iat});
    assert.equal(token, "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjEzNjUwMjgyMzMsInYiOjAsImQiOm51bGx9.CRO-O-BUJvcN8r0yXnXGkIr4MQ77vh-968dj29GLcp4");
  });

  it("should preserve all provided options", function() {
    var iat = Math.round(new Date().getTime());
    var expires = iat + 1000;
    var notBefore = iat + 10;

    var token = obj.createToken({foo: "bar"}, {
      iat: iat, expires: expires, notBefore: notBefore, admin: false, debug: true
    });

    var parts = token.split(".");
    var body = parts[1].replace("-", "+").replace("_", "/");
    body = JSON.parse(new Buffer(body, "base64"));

    assert.equal(body.iat, iat);
    assert.equal(body.exp, expires);
    assert.equal(body.nbf, notBefore);
    assert.equal(body.admin, false);
    assert.equal(body.debug, true);
    assert.equal(body.d.foo, "bar");
  });
});
