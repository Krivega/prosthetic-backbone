/**
 * @fileOverview Validation mixin for Backbone models
 */
'use strict';

var _ = require('underscore');
var utils = require('utils'); // jshint ignore:line

/**
 * Validates an attribute against all validators defined
 * for that attribute. If one or more errors are found,
 * the first error message is returned.
 * If the attribute is valid, an empty string is returned.
 * @param model
 * @param attr
 * @param value
 * @param rules
 * @returns {boolean}
 */
function validateAttr(model, attr, value, rules) {
  var errors = [];
  if (rules) {
    _.each(rules, function(rule, prop) {
      var error;
      var ruleName = _.isNumber(prop) ? rule : prop;
      if (_.isObject(rule) && !_.isArray(rule)) {
        var result = validateAttr(model, attr, value, rule);
        if (result) {
          errors = errors.concat(result);
        }
      } else if (model.patterns[ruleName]) {
        error = _.bind(model.validators.pattern, model, value, attr, rule)();
      } else {
        if (model.validators[ruleName]) {
          error = _.bind(model.validators[ruleName], model, value, attr, rule)();
        } else {
          console.info('Validation rule is not Implemented: ' + ruleName);
        }
      }

      if (error) {
        errors.push({
          field: attr,
          body: error
        });
      }
    });
  }

  if (!errors.length) {
    errors = false;
  }

  return errors;
}

/**
 * Loops through the model's attributes and validates them all.
 * Returns and object containing names of invalid attributes
 * as well as error messages.
 * @param model
 * @param attrs
 * @param validatedAttrs
 * @returns {Object} {
 *   invalidAttrs: {
 *     propName: [
 *       {
 *         field: 'fieldName',
 *         body: 'Error message'
 *       },
 *       ..
 *       {field, body}
 *     ],
 *     propName2: [...]
 *   },
 *   isValid: boolean
 * }
 */
function validateModel(model, attrs, validatedAttrs) {
  var error;
  var errorResult = createErrorResult();
  _.each(validatedAttrs, function(rules, attr) {
    error = validateAttr(model, attr, attrs[attr], rules);
    if (error) {
      errorResult.addErrors(attr, error);
    }
  });

  return errorResult;
}

function createErrorResult() {
  return {
    isValid: true,

    invalidAttrs: {},

    addError: function(attr, error) {
      this.isValid = false;
      if (!this.invalidAttrs[attr]) {
        this.invalidAttrs[attr] = [];
      }

      this.invalidAttrs[attr].push({
        field: error.field,
        token: error.token,
        body: error.body,
        params: error.params
      });
      return this;
    },

    addErrors: function(attr, errors) {
      if (!_.isArray(errors)) errors = [errors];
      _.each(errors, function(error) {
        this.addError(attr, error);
      }, this);

      return this;
    }
  };
}

//noinspection FunctionWithInconsistentReturnsJS
module.exports = {

  _isValid: null,

  messages: {
    required: 'isEmpty',
    greaterThan: 'Value must be greater than {1}',
    greaterThanEqual: 'Value must be greater than or equal to {1}',
    lessThan: 'Value must be less than {1}',
    lessThanEqual: 'Value must be less than or equal to {1}',
    olderThan: 'Age must be {1} or greater',
    youngerThan: 'Age must be {1} or less',
    personDob: 'invalidDob',
    minLength: 'stringLengthTooShort',
    maxLength: 'stringLengthTooLong',
    rangeLength: '{0} must be between {1} and {2} characters',
    number: 'This field value must be a number',
    integer: 'This field value must be an integer',
    email: 'emailAddressInvalid',
    date: 'invalidDate'
  },

  /**
   * @property {object|function} validatedAttrs Definition of validation attributes.
   * Can be function, e.g. validatesAttr(attrs), to dynamically define set
   */
  validatedAttrs: {
    //  email: ['email', 'required']
  },

  patterns: {
    // Matches any number (e.g. 100.000)
    number: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/,

    // Matches a valid email address (e.g. mail@example.com)
    email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i // jshint ignore:line
  },

  validators: (function() {
    // Use native trim when defined
    var trim = String.prototype.trim ?
      function(text) {
        return text === null ? '' : String.prototype.trim.call(text);
      } :

      function(text) {
        var trimLeft = /^\s+/;
        var trimRight = /\s+$/;

        return text === null ? '' : text.toString().replace(trimLeft, '').replace(trimRight,
          '');
      };

    // Determines whether or not a value is empty
    function hasValue(value, allitems) {
      var isValue = true;
      if (_.isArray(value) && !_.isEmpty(value)) {
        for (var i = 0; i < value.length; i++) {
          if (allitems) {
            if (!hasValue(value[i])) {
              isValue = false;
              break;
            }
          } else {
            isValue = hasValue(value[i]) ? true : false;
          }
        }
      } else {
        isValue = !(_.isNull(value) ||
          _.isUndefined(value) ||
          (_.isString(value) && trim(value) === '') ||
          (_.isArray(value) && _.isEmpty(value)));
      }

      return isValue;
    }

    function hasDate(value) { // jshint ignore:line
      //return utils.isValidDate(value, utils.getDatePickerFormat());

      return true;
    }

    //noinspection FunctionWithInconsistentReturnsJS
    return {
      // Required validator
      // Validates if the attribute is required or not
      // This can be specified as either a boolean value or
      // a function that returns a boolean value
      required: function(value, attr) {
        if (!hasValue(value) || value === '') {
          return this.formatMessage(this.messages.required, attr);
        }
      },

      requiredAllItems: function(value, attr) {
        if (!hasValue(value, true) || value === '') {
          return this.formatMessage(this.messages.required, attr);
        }
      },

      required$: function(value, attr) {
        if (!hasValue(value) || value === '' || value === '$' || value === 0) {
          return this.formatMessage(this.messages.required, attr);
        }
      },

      requiredAllItems$: function(value, attr) {
        if (!hasValue(value, true) || value === '' || value === '$') {
          return this.formatMessage(this.messages.required, attr);
        }
      },

      date: function(value, attr) {
        if (!hasValue(value) || value === '' || value === 'invalidDate' || !hasDate(value)) {
          return this.formatMessage(this.messages.date, attr);
        }
      },

      notEmpty: function(value, attr, placeholder) {
        var isValid = hasValue(value) && value !== '' && value !== false;
        if (isValid && placeholder) {
          value += ''; // to string
          isValid = value.trim() !== placeholder;
          isValid &= +value.replace(placeholder, '') !== 0;
        }

        if (!isValid) {
          return this.formatMessage(this.messages.required, attr);
        }
      },

      notEmptyWithToken: function(value, attr, errorToken) {
        if (!hasValue(value) || value === '' || value === false || value === 0) {
          return _t(errorToken, attr);
        }
      },

      // Min length validator
      // Validates that the value has to be a string with length equal to or greater than
      // the min length value specified
      minLength: function(value, attr, minLength) {
        if (!_.isString(value) || value.length < minLength) {
          return this.formatMessage(this.messages.minLength, attr, minLength);
        }
      },

      // @todo: Unclear how to use this
      // Max length validator
      // Validates that the value has to be a string with length equal to or less than
      // the max length value specified
      maxLength: function(value, attr, maxLength) {
        if (!_.isString(value) || value.length > maxLength) {
          return this.formatMessage(this.messages.maxLength, attr, maxLength);
        }
      },

      // Range length validator
      // Validates that the value has to be a string and equal to or between
      // the two numbers specified
      rangeLength: function(value, attr, range) {
        if (!_.isString(value) || value.length < range[0] || value.length > range[1]) {
          return this.formatMessage(this.messages.rangeLength, attr, range[0], range[1]);
        }
      },

      // Greater than validator
      // Validates that the value is greater than min value
      // the min value specified
      greaterThan: function(value, attr, minValue) {
        if (+value <= minValue) {
          return this.formatMessage(this.messages.greaterThan, attr, minValue);
        }
      },

      // Greater than validator
      // Validates that the value is greater or equal than min value
      // the min value specified
      greaterThanEqual: function(value, attr, minValue) {
        if (+value < minValue) {
          return this.formatMessage(this.messages.greaterThanEqual, attr, minValue);
        }
      },

      // Less than validator
      // Validates that the value is less than max value
      // the max value specified
      lessThan: function(value, attr, maxValue) {
        if (+value >= maxValue) {
          return this.formatMessage(this.messages.lessThan, attr, maxValue);
        }
      },

      // Less than or equal validator
      // Validates that the value is less than or equal to max value
      // the max value specified
      lessThanEqual: function(value, attr, maxValue) {
        if (+value > maxValue) {
          return this.formatMessage(this.messages.lessThanEqual, attr, maxValue);
        }
      },

      // Less than or equal validator
      // Validates that the value is less than or equal to max value
      // the max value specified
      lessThanEqualMoney: function(value, attr, maxValue) {
        if (+value > maxValue) {
          return this.formatMessage(this.messages.lessThanEqual, attr,
            utils.formatMoneyEx(maxValue));
        }
      },

      // Pattern validator
      // Validates that the value has to match the pattern specified.
      // Can be a regular expression or the name of one of the built in patterns
      pattern: function(value, attr, pattern) {
        if (!hasValue(value) || !value.toString().match(this.patterns[pattern] || pattern)) {
          return this.formatMessage(this.messages[pattern], attr, pattern); // jshint ignore:line
        }
      },

      /**
       * value should be in YYYY-MM-DD format
       * Validates that the age is equal to minValue or greater
       *
       * e.g of usage validatedAttrs.dob = ['required', {olderThan: 3}]
       *
       * @param value
       * @param attr
       * @param minValue
       * @returns {string|undefined}
       */
      olderThan: function(value, attr, minValue) {
        if (!utils.isOlderThan(value, minValue)) {
          return this.formatMessage(this.messages.olderThan, attr, minValue);
        }
      },

      /**
       * Value should be in YYYY-MM-DD format
       * validates that the age is equal to maxValue or less
       * e.g of usage validatedAttrs.dob = ['required', {youngerThan: 110}]
       *
       * @param value
       * @param attr
       * @param maxValue
       * @returns {string|undefined}
       */
      youngerThan: function(value, attr, maxValue) {
        if (utils.isOlderThan(value, maxValue + 1)) {
          return this.formatMessage(this.messages.youngerThan, attr, maxValue);
        }
      },

      /**
       * value should be in YYYY-MM-DD format
       * Checks that dob is within the range using 2 validtors olderThan and youngerThan
       * Returns custom message
       *
       * @see olderThan
       * @see youngerThan
       *
       * @param value
       * @param attr
       * @returns {string|undefined}
       */
      personDob: function(value, attr) {
        var minPersonAge = 3;
        var maxPersonAge = 110;
        var validators = this.validators;
        let olderThanError = validators.olderThan.call(this, value, attr, minPersonAge);
        if (olderThanError) {
          return this.formatMessage(this.messages.personDob, attr);
        }
        let youngerThanError = validators.youngerThan.call(this, value, attr, maxPersonAge);
        if (youngerThanError) {
          return this.formatMessage(this.messages.personDob, attr);
        }
      },

      /**
       * Validate person age using value from datepicker
       * @note It no value passed - validation will be passed
       * @note Value is converting from datepicker format to server
       * @see personDob
       *
       * @param value
       * @param attr
       * @returns {string|undefined}
       */
      personDobDatepicker: function(value, attr) {
        if (value) {
          value = utils.formatDateToServer(value, true);
          return this.validators.personDob.call(this, value, attr);
        }
      },

      // Integer validator
      integer: function(value, attr) {
        if (+value !== Math.round(value)) {
          return this.formatMessage(this.messages.integer, attr);
        }
      }
    };
  }()),

  formatMessage: function() {
    var args = Array.prototype.slice.call(arguments);
    var text = args.shift();
    return text.replace(/\{(\d+)}/g, function(match, number) {
      return typeof args[number] !== 'undefined' ? args[number] : match;
    });
  },

  /**
   * Perform model validation. Invoked by .validate()
   * @param  {Object} validatedAttrs Set of rules specified for model
   * @param  {Object} attrs          New model attributes
   * @return {Object}                Result of validation. {invalidAttrs: Object, isValid: Boolean}
   */
  toValidate: function(validatedAttrs, attrs) {
    return validateModel(this, attrs, validatedAttrs);
  },

  performValidation: function(attrs) {
    attrs = attrs || this.attributes;
    var validatedAttrs = _.isFunction(this.validatedAttrs) ? this.validatedAttrs(attrs) :
      this.validatedAttrs;

    return this.toValidate(validatedAttrs, attrs);
  },

  validate: function(attrs) {
    var result = this.performValidation(attrs);
    this._isValid = !!result.isValid;
    if (this._isValid === false) {
      this.trigger('validateError', result);
      return result.invalidAttrs;
    }

    this.trigger('validateSuccess', this);

    return null;
  }
};
