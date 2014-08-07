describe("TokenGenerator Tests", function () {

  it("Token smoke test", function () {
    var tokengenerator = new FirebaseTokenGenerator("test_secret");
    var token = tokengenerator.createToken({blah: 5});
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);
  });

  it("Allowed options test", function () {
    var tokengenerator = new FirebaseTokenGenerator("test_secret");

    //unknown option
    expect(function() {
      tokengenerator.createToken({blah: 5}, {'sdkhdgrkr' : false})
    }).toThrow();

    //invalid option
    expect(function() {
      tokengenerator.createToken({blah: 5}, {'expires' : false})
    }).toThrow();

    //invalid option
    expect(function() {
      tokengenerator.createToken({blah: 5}, {'notBefore' : "hello"})
    }).toThrow();

    //invalid option
    expect(function() {
      tokengenerator.createToken({blah: 5}, {'admin' : 5})
    }).toThrow();

    //invalid option
    expect(function() {
      tokengenerator.createToken({blah: 5}, {'debug' : function() {}})
    }).toThrow();

    //null option
    expect(function() {
      tokengenerator.createToken({blah: 5}, {'expires' : null})
    }).toThrow();

    //NaN option
    expect(function() {
      tokengenerator.createToken({blah: 5}, {'expires' : NaN})
    }).toThrow();

    //valid options shouldn't throw
    tokengenerator.createToken({blah: 5}, {
      'expires' : 1234,
      'notBefore' : 133234,
      'admin' : true,
      'debug' : false
    })
  });

  it("Null args test", function () {
    //this should throw
    expect(function() {
      new FirebaseTokenGenerator(null);
    }).toThrow();

    var t = new FirebaseTokenGenerator("blah");

    //this should throw
    expect(function() {
      t.createToken(null, null);
    }).toThrow();

    // Null data.
    expect(function() {
      t.createToken(null);
    }).toThrow();

    // Empty data.
    expect(function() {
      t.createToken({ });
    }).toThrow();

    // Empty data with options shouldn't throw.
    t.createToken({ admin: true });

    expect(function() {
      t.createToken({}, {'expires': 0})
    }).toThrow();

    expect(function() {
      t.createToken(null, {'expires': 0})
    }).toThrow();

    expect(function() {
      t.createToken({}, {'notBefore': 0})
    }).toThrow();

    expect(function() {
      t.createToken(null, {'notBefore': 0})
    }).toThrow();

    expect(function() {
      t.createToken({}, {'iat': 0})
    }).toThrow();

    expect(function() {
      t.createToken(null, {'iat': 0})
    }).toThrow();

    t.createToken({}, {'debug': true})
  });
});

