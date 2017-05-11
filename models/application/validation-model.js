/**
 * @fileOverview Generic validation model
 */
'use strict';

const Model = require('../model');
const ValidationMixin = require('./validation-mixin');

/**
 * @class ValidateModel
 * @augments BaseModel
 * @augments ValidationMixin
 * @description Base class for forms
 */
module.exports = Model.extend(ValidationMixin).extend( /** @lends ValidateModel */ {

  /**
   * Clear all attributes on the model, firing `"change"`.
   *
   * @return {object} model
   */
  clear: function() {
    this._isValid = null;
    return Model.prototype.clear.apply(this, arguments);
  }

}, /** @lends ValidateModel */ {

  /**
   * Format error message according to 'errors.md'
   *
   * @param  {object} errorMessages Errors in validator format. See 'validateModel' method
   * @return {Object}       Errors in Football.com format
   * @static
   */
  formatErrors: function(errorMessages) {
    const errors = errorMessages.invalidAttrs;
    const errorData = {
      messages: []
    };

    for (let error in errors) {
      errorData.messages = errorData.messages.concat(errors[error]);
    }

    return errorData;
  }

});
