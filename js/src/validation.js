goog.provide('fb.tokengenerator.validation');

/**
 * Check to make sure the appropriate number of arguments are provided for a public function.
 * Throws an error if it fails.
 *
 * @param {String} fnName The function name
 * @param {Number} minCount The minimum number of arguments to allow for the function call
 * @param {Number} maxCount The maxiumum number of argument to allow for the function call
 * @param {Number} argCount The actual number of arguments provided.
 */
fb.tokengenerator.validation.validateArgCount = function(fnName, minCount, maxCount, argCount) {
  var argError;
  if (argCount < minCount) {
    argError = 'at least ' + minCount;
  } else if (argCount > maxCount) {
    argError = (maxCount === 0) ? 'none' : ('no more than ' + maxCount);
  }

  if (argError) {
    var error = fnName + ' failed: Was called with ' + argCount +
      ((argCount === 1) ? ' argument.' : ' arguments.') +
      ' Expects ' + argError + '.';
    throw new Error(error);
  }
};

/**
 * Generates a string to prefix an error message about failed argument validation
 *
 * @param {String} fnName The function name
 * @param {Number} argumentNumber The index of the argument
 * @param {Boolean} optional Whether or not the argument is optional
 * @return {String} The prefix to add to the error thrown for validation.
 * @private
 */
fb.tokengenerator.validation.errorPrefix_ = function(fnName, argumentNumber, optional) {
  var argName = '';
  switch (argumentNumber) {
    case 1:
      argName = optional ? 'first' : 'First';
      break;
    case 2:
      argName = optional ? 'second' : 'Second';
      break;
    case 3:
      argName = optional ? 'third' : 'Third';
      break;
    case 4:
      argName = optional ? 'fourth' : 'Fourth';
      break;
    default:
      fb.core.util.validation.assert(false, 'errorPrefix_ called with argumentNumber > 4.  Need to update it?');
  }

  var error = fnName + ' failed: ';

  error += argName + ' argument ';
  return error;
};

/**
 * Validates the provided secret.
 * @param { String } fnName The name of the calling function.
 * @param { Integer } argumentNumber The index of the arguement passed.
 * @param { String } secret The provided secret.
 *
 * @throws Error
 */
fb.tokengenerator.validation.validateSecret = function(fnName, argumentNumber, secret) {
  if (!goog.isString(secret)) {
    throw new Error(fb.tokengenerator.validation.errorPrefix_(fnName, argumentNumber, false) + 'must be a valid firebase namespace secret.');
  }
};

/**
 * Validates the provided credential data.
 * @param { String } fnName The name of the calling function.
 * @param { Integer } argumentNumber The index of the arguement passed.
 * @param { Object } data The provided credential data.
 * @param { Boolean } isAdminToken Whether the credential options have the admin flag set.
 *
 * @throws Error
 */
fb.tokengenerator.validation.validateCredentialData = function(fnName, argumentNumber, data, isAdminToken) {
  var isDataAnObject = (typeof data === 'object');
  if (data === null || !isDataAnObject) {
    if (!isDataAnObject && !isAdminToken) {
      throw new Error(fb.tokengenerator.validation.errorPrefix_(fnName, argumentNumber, false) + 'must be a dictionary of token data.');
    }
  } else if (data.uid === null || typeof data.uid !== 'string') {
    if (!isAdminToken || (typeof data.uid !== 'undefined')) {
      throw new Error(fb.tokengenerator.validation.errorPrefix_(fnName, argumentNumber, false) + 'must contain a \"uid\" key that must be a string.');
    }
  } else if (data.uid.length > 256) {
    throw new Error(fb.tokengenerator.validation.errorPrefix_(fnName, argumentNumber, false) + 'must contain a \"uid\" key that must not be longer than 256 bytes.');
  }
};

/**
 * Validates the provided credential options.
 * @param { String } fnName The name of the calling function.
 * @param { Integer } argumentNumber The index of the arguement passed.
 * @param { Object } opt The provided credential options.
 *
 * @throws Error
 */
fb.tokengenerator.validation.validateCredentialOptions = function(fnName, argumentNumber, opt) {
  if (!goog.isDef(opt)) {
    return;
  }

  if (opt === null || typeof opt !== 'object') {
    throw new Error(fb.tokengenerator.validation.errorPrefix_(fnName, argumentNumber, true) + 'must be a dictionary of token options.');
  }
};

/**
 * Validates a single option.
 * @param { String } prefix The error prefix.
 * @param { String } optName The name of the option to validate.
 * @param { * } opt The Option to validate.
 * @param { String } expectedType The expected type of the option.
 * @param { String } suffix The error suffix.
 *
 * @throws Error
 */
fb.tokengenerator.validation.validateOption = function(prefix, optName, opt, expectedType, suffix) {
  if (typeof opt !== expectedType || (expectedType === 'number' && isNaN(opt))) {
    throw new Error(prefix + ' option \"' + optName + '\" must be ' + suffix + ', instead got ' + opt);
  }
};

/**
 * Validates the generated token.
 * @param { String } token The generated token.
 *
 * @throws Error
 */
fb.tokengenerator.validation.validateGeneratedToken = function(token) {
  if (token.length > 1024) {
    throw new Error('Generated token must be less than 1024 bytes long');
  }
};
