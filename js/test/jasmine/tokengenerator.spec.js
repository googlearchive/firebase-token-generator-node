describe("TokenGenerator Tests", function () {

  it("Token smoke test", function () {
    var tokengenerator = new FirebaseTokenGenerator("test_secret");
    var token = tokengenerator.createToken({blah: 5, uid: 'blah'});
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);
  });

  it("Allowed options test", function () {
    var tokengenerator = new FirebaseTokenGenerator("test_secret");

    //unknown option
    expect(function() {
      tokengenerator.createToken({blah: 5, uid: 'blah'}, {'sdkhdgrkr' : false})
    }).toThrow();

    //invalid option
    expect(function() {
      tokengenerator.createToken({blah: 5, uid: 'blah'}, {'expires' : false})
    }).toThrow();

    //invalid option
    expect(function() {
      tokengenerator.createToken({blah: 5, uid: 'blah'}, {'notBefore' : "hello"})
    }).toThrow();

    //invalid option
    expect(function() {
      tokengenerator.createToken({blah: 5, uid: 'blah'}, {'admin' : 5})
    }).toThrow();

    //invalid option
    expect(function() {
      tokengenerator.createToken({blah: 5, uid: 'blah'}, {'debug' : function() {}})
    }).toThrow();

    //null option
    expect(function() {
      tokengenerator.createToken({blah: 5, uid: 'blah'}, {'expires' : null})
    }).toThrow();

    //NaN option
    expect(function() {
      tokengenerator.createToken({blah: 5, uid: 'blah'}, {'expires' : NaN})
    }).toThrow();

    //No uid
    expect(function() {
      tokengenerator.createToken({blah: 5}, {'expires': 0})
    }).toThrow();

    //Non-string uid
    expect(function() {
      tokengenerator.createToken({blah: 5, uid: 5}, {'expires': 0})
    }).toThrow();

    //uid max length
    //length:                                 10        20        30        40        50        60        70        80        90       100       110       120       130       140       150       160       170       180       190       200       210       220       230       240       250   256
    tokengenerator.createToken({uid: '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456'}, {'expires': 0})

    //uid too long
    expect(function() {
      //length:                                 10        20        30        40        50        60        70        80        90       100       110       120       130       140       150       160       170       180       190       200       210       220       230       240       250    257
      tokengenerator.createToken({uid: '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567'}, {'expires': 0})
    }).toThrow();

    //uid empty string
    tokengenerator.createToken({uid: ''});

    //Generated token too long
    expect(function() {
      tokengenerator.createToken({uid: 'blah', longVar: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345612345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234561234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456'})
    }).toThrow();

    //no uid with admin flag
    tokengenerator.createToken(null, {'admin': true});
    tokengenerator.createToken({}, {'admin': true});
    tokengenerator.createToken({foo: 'bar'}, {'admin': true});
    tokengenerator.createToken({uid: undefined, foo: 'bar'}, {'admin': true});

    //invalid uid with admin flag
    expect(function() {
      tokengenerator.createToken({uid: 1}, {'admin': true});
    });
    expect(function() {
      tokengenerator.createToken({uid: null}, {'admin': true});
    });
    expect(function() {
      tokengenerator.createToken("foo", {'admin': true});
    });

    //valid options shouldn't throw
    tokengenerator.createToken({blah: 5, uid: 'blah'}, {
      'expires' : 1234,
      'notBefore' : 133234,
      'admin' : true,
      'debug' : false
    });
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

    t.createToken({uid: 'blah'}, {'debug': true})
  });
});

