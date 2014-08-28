goog.provide("fb.tokengenerator.validation");

/**
 * Check to make sure the appropriate number of arguments are provided for a public function.
 * Throws an error if it fails.
 *
 * @param fnName {String} The function name
 * @param minCount {Number} The minimum number of arguments to allow for the function call
 * @param maxCount {Number} The maxiumum number of argument to allow for the function call
 * @param argCount {Number} The actual number of arguments provided.
 */
fb.tokengenerator.validation.validateArgCount = function(fnName, minCount, maxCount, argCount) {
  var argError;
  if (argCount < minCount) {
    argError = "at least " + minCount;
  } else if (argCount > maxCount) {
    argError = (maxCount === 0) ? "none" : ("no more than " + maxCount);
  }

  if (argError) {
    var error = fnName + " failed: Was called with " + argCount +
      ((argCount === 1) ? " argument." : " arguments.") +
      " Expects " + argError + ".";
    throw new Error(error);
  }
};

/**
 * Generates a string to prefix an error message about failed argument validation
 *
 * @param fnName {String} The function name
 * @param argumentNumber {Number} The index of the argument
 * @param optional {Boolean} Whether or not the argument is optional
 * @return {String} The prefix to add to the error thrown for validation.
 * @private
 */
fb.tokengenerator.validation.errorPrefix_ = function(fnName, argumentNumber, optional) {
  var argName = "";
  switch (argumentNumber) {
    case 1:
      argName = optional ? "first" : "First";
      break;
    case 2:
      argName = optional ? "second" : "Second";
      break;
    case 3:
      argName = optional ? "third" : "Third";
      break;
    case 4:
      argName = optional ? "fourth" : "Fourth";
      break;
    default:
      fb.core.util.validation.assert(false, "errorPrefix_ called with argumentNumber > 4.  Need to update it?");
  }

  var error = fnName + " failed: ";

  error += argName + " argument ";
  return error;
};

fb.tokengenerator.validation.validateSecret = function(fnName, argumentNumber, secret) {
  if (!goog.isString(secret)) {
    throw new Error(fb.tokengenerator.validation.errorPrefix_(fnName, argumentNumber, false) + "must be a valid firebase namespace secret.");
  }
};

fb.tokengenerator.validation.validateCredentialData = function(fnName, argumentNumber, data, optional, isAdminToken) {
  var isDataAnObject = (typeof data === "object");
  if (data === null || !isDataAnObject) {
    if (!isDataAnObject && !isAdminToken) {
      throw new Error(fb.tokengenerator.validation.errorPrefix_(fnName, argumentNumber, optional) + "must be a dictionary of token data.");
    }
  } else if (data.uid === null || typeof data.uid !== "string") {
    if (!isAdminToken || (typeof data.uid !== "undefined")) {
      throw new Error(fb.tokengenerator.validation.errorPrefix_(fnName, argumentNumber, optional) + "must contain a \"uid\" key that must be a string.");
    }
  } else if (data.uid.length > 256) {
    throw new Error(fb.tokengenerator.validation.errorPrefix_(fnName, argumentNumber, optional) + "must contain a \"uid\" key that must not be longer than 256 bytes.");
  }
};

fb.tokengenerator.validation.validateCredentialOptions = function(fnName, argumentNumber, opt, optional) {
  if (optional && !goog.isDef(opt)) {
    return;
  }

  if (opt === null || typeof opt != "object") {
    throw new Error(fb.tokengenerator.validation.errorPrefix_(fnName, argumentNumber, optional) + "must be a dictionary of token options.");
  }
};

fb.tokengenerator.validation.validateOption = function(prefix, optName, opt, expectedType, suffix) {
  if (typeof opt !== expectedType || (expectedType === "number" && isNaN(opt))) {
    throw new Error(prefix + " option \"" + optName + "\" must be " + suffix + ", instead got " + opt);
  }
};

fb.tokengenerator.validation.validateGeneratedToken = function(token) {
  if (token.length > 1024) {
    throw new Error("Generated token must be less than 1024 bytes long");
  }
};
