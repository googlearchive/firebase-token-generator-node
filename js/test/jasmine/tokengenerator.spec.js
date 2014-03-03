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

    //unknown option
    expect(function() {
      tokengenerator.createToken({blah: 5}, {'expires' : false})
    }).toThrow();

    //unknown option
    expect(function() {
      tokengenerator.createToken({blah: 5}, {'notBefore' : "hello"})
    }).toThrow();

    //unknown option
    expect(function() {
      tokengenerator.createToken({blah: 5}, {'admin' : 5})
    }).toThrow();

    //unknown option
    expect(function() {
      tokengenerator.createToken({blah: 5}, {'debug' : function() {}})
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
  });
});

