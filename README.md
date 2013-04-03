# Node.js Token Generator Library

Firebase provides our own easy-to-use auth token generating library for Node.js, 
which you can install as shown:

```bash
    $ npm install firebase-token-generator
```

To generate tokens, you'll need your Firebase Secret which you can find by 
entering your Firebase URL into a browser and clicking the "Auth" tab.
<span style="color:red">NOTE: You should only generate tokens on trusted 
servers since it requires your Firebase Secret.</span>

Once you've downloaded the library and grabbed your Firebase Secret, you can 
generate a token with this snippet of Node.js code:

```js
    var FirebaseTokenGenerator = require("firebase-token-generator");
    var tokenGenerator = new FirebaseTokenGenerator(YOUR_FIREBASE_SECRET);
    var token = tokenGenerator.createToken({some: "arbitrary", data: "here"});
```

You pass `createToken()` an arbitrary JSON object which is then available for 
use within your security rules via the [auth variable](https://www.firebase.com/docs/security/rule-expressions/auth.html).
This is how you pass trusted authentication details (e.g. the client's user 
id) into your Firebase rules.

You can specify a second (options) argument to createToken which can contain 
options and flags to modify how Firebase treats the token. Available options 
are:

* **expires** (Number) - A timestamp (as number of seconds since epoch)
denoting the time after which this token should no longer be valid.

* **notBefore** (Number) - A timestamp (as number of seconds since epoch)
denoting the time before which this token should be rejected by the server.

* **admin** (boolean) - Set to true if you want to disable all
[security rules](https://www.firebase.com/docs/security/rule-expressions/index.html) for this client.

* **debug** (boolean) - Set to true to enable debug output from your Security 
Rules.  This debug output will be automatically output to the JavaScript 
console for any client that's authenticated with a token with the debug flag 
set to true.  You should generally <i>not</i> leave this set to true in 
production (as it slows down the rules implementation and gives your users 
visibility into your rules), but it can be helpful for debugging.

You can generate a token with options by passing a second argument to 
`createToken()`, as shown:

```js
    var token = tokenGenerator.createToken(
      {some: "arbitrary", data: "here"},
      {admin: true}
    );
```

Testing
-------
The test suite is in test/test.js. Run it by:

```bash
    $ npm install -g mocha
    $ mocha
    5 tests complete
```

License
-------
[MIT](http://firebase.mit-license.org)
