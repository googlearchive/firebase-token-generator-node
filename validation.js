goog.provide("fb.tokengenerator.validation");
goog.require("fb.util.validation");

fb.tokengenerator.validation.validateSecret = function(fnName, argumentNumber, secret) {
  if (!goog.isString(secret))
    throw new Error(fb.util.validation.errorPrefix_(fnName, argumentNumber, false) + "must be a valid firebase namespace secret.");
};

fb.tokengenerator.validation.validateCredentialData = function(fnName, argumentNumber, cred, optional) {
  //TODO: I can prob do a better job here. It needs to be JSON-stringifiable

};

fb.tokengenerator.validation.validateCredentialOptions = function(fnName, argumentNumber, opt, optional) {
  if (optional && !goog.isDef(opt))
    return;
  if(opt == null || typeof opt != "object")
    throw new Error(fb.util.validation.errorPrefix_(fnName, argumentNumber, optional) + "must be a dictionary of token options.");
};


fb.tokengenerator.validation.validateOption = function(prefix, optName, opt, expectedType, suffix) {
  if(typeof opt !== expectedType)
    throw new Error(prefix + " option " + optName + " must be " + suffix);
};