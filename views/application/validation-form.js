/*
 * @file Form view that renders errors
 */
'use strict';

const _ = require('underscore');
const utils = require('utils');
const FormView = require('./masked-form');
const vent = require('runtime/vent');
const ValidationModel = require('models/application/validation-model');
const scroller = require('views/ui/scroller');

module.exports = FormView.extend({

  isValid: false,

  isCheck: false,

  enableAlerts: false,

  subFormsCase: 'subviews',

  requiredFields: {
    //email: ['required']
  },

  /**
   * @class ValidationForm
   * @augments Form
   * @description ValidationForm class
   * @constructor
   * @property {boolean} isValid
   * @property {boolean} isCheck
   * @property {boolean} enableAlerts - Set true to show unhandled errors in global alerts
   * @property {object} requiredFields - contain required fields
   * @name ValidationForm
   */
  initialize: function() {
    FormView.prototype.initialize.apply(this, arguments);
    this.initModelListeners();
  },

  /**
   * Init model listeners
   */
  initModelListeners: function() {
    if ((this.model && this.model.toValidate)) {
      this.listenTo(this.model, 'validateError', this.onValidateError);
      this.listenTo(this.model, 'validateSuccess', this.hideErrors);
    }
  },

  /**
   * Hide errors
   * Call when onChange event triggered
   *
   * @param {object} e - DOM event object
   * @return {object} this
   */
  hideErrorOnChange: function(e) {
    if (e && e.currentTarget && !this.isEmptyElement(e.currentTarget)) {
      this.hideError(e.currentTarget.name);
    }
    return this;
  },

  /**
   * Returns true if element is empty
   *
   * @param {object} element - DOM element
   * @return {boolean}
   */
  isEmptyElement: function(element) {
    const data = utils.serializeObject(element);
    if (!data) return true;
    return !data[element.name];
  },

  /**
   * validate form
   *
   * @return {boolean}
   */
  validateForm: function() {
    let isValid;
    if (!this.model.toValidate) return this.isValid = true; // jshint ignore:line

    // @todo Data comes to model without server validation
    this.serializeToModel({
      validate: true
    });
    isValid = this.model._isValid;
    this.isValid = isValid;
    if (!isValid) this.trigger('validateFormError');
    return isValid;
  },

  /**
   * Check form fields ONLY
   *
   * @return {object} Check result
   */
  checkFields: function() {
    const result = {
      isValid: true
    };

    // @todo Probably we can return'true' directly from Model
    if (!this.model.toValidate) return result;

    const formData = this.serialize();
    const requiredFields =
      _.isFunction(this.requiredFields) ? this.requiredFields(formData) : this.requiredFields;

    return this.model.toValidate(requiredFields, formData);
  },

  /**
   * Check form fields and perform corresponding actions
   *
   * @param  {boolean} showErrors Set 'true' to show validation errors on form
   * @return  {boolean} is check
   */
  checkForm: function(showErrors) {
    this.filterEmailFields();
    const vResult = this.checkFields();
    const isCheck = vResult.isValid;
    const $btn = this.$('.button[type=submit]');

    // Support for legacy forms where submit button is disabled by default
    $btn.prop('disabled', false);

    if ($btn.hasClass('js-incomplete')) {
      $btn.toggleClass('is-incomplete', !isCheck);
    }

    if (showErrors && !isCheck) {
      this.onValidateError(vResult);
    }

    this.isCheck = isCheck;
    this.trigger('checkForm', isCheck);
    return this.isCheck;
  },

  /**
   * Filter email fields
   */
  filterEmailFields: function() {
    this.$('[type=email]').each(function() {
      if (this.value) {
        if (this.value !== this.value.trim()) { //noinspection JSPotentiallyInvalidUsageOfThis
          this.value = this.value.trim();
        }
      }
    });
  },
  /**
   * Show form errors
   *
   * @param  {object} errors See 'errors.md' for format description
   * @return {object}        Return self instance of view
   */
  showErrors: function(errors, options = {}) {
    if (!options.noHideErrors) {
      this.hideErrors();
    }

    // If object doesn't contain 'messages' it contains error objects for subviews
    if (errors.messages) {
      _.each(errors.messages, (error) => {
        this.showError(error, errors.status);
      }, this);
    } else {
      this.showSubViewErrors(errors);
    }

    this.scrollToError();
    return this;
  },

  /**
   * method can be overwritten
   * @returns {*}
   */
  getFirstError: function() {
    return this.$('.js-error.is-visible').parents('.js-field:first');
  },

  /**
   * Scroll to first error element
   */
  scrollToError: function() {
    const $firstError = this.getFirstError();
    if ($firstError.length === 1) {
      scroller.scrollTo($firstError, {
        paddingTop: 10, // 10 for better look
        duration: 0
      });
      this.focusErrorInput();
    }
    return this;
  },

  /**
   * Focus to error input
   *
   * @return {object} Return self instance of view
   */
  focusErrorInput: function() {
    const $firstError = this.$('.js-error.is-visible').parent().first();
    let $input;

    if ($firstError.length === 0) return this;

    $input = $firstError.find('input,select,button');
    if ($input) $input.first().focus();

    return this;
  },

  /**
   * Show errors for subviews.
   * Required usage of .subRender() to count subviews
   *
   * @param  {object} errors See .showErrors() for details
   */
  showSubViewErrors: function(errors) {
    const keys = Object.keys(errors);

    keys.forEach(function(key) {
      const viewIdx = parseInt(key.replace('view', ''), 10);
      const view = this[this.subFormsCase][viewIdx];

      // @todo .showErrors check is hotfix
      // this method should call for subforms collection only
      if (view && view.showErrors) {
        view.showErrors(errors[key]);
      }
    }, this);
  },

  /**
   * Get error elements
   *
   * @return {array} list of error elements
   */
  getErrorElements: function() {
    return this.$('.js-error');
  },

  /**
   * Hide error elements
   *
   * @return {object} this
   */
  hideErrors: function() {
    this.getErrorElements().empty().removeClass('is-visible');
    return this;
  },

  /**
   * Hide error field
   *
   * @param  {string} field - field name
   */
  hideError: function(field) {
    let $fieldMessage;
    if (field === null) {
      $fieldMessage = this.getErrorElements().filter('.js-error-form');
    } else {
      $fieldMessage = this.getErrorElements().filter('[data-for=' + field + ']');
    }
    if ($fieldMessage.length > 0) {
      $fieldMessage.empty().removeClass('is-visible');
    }
  },

  /**
   * Show error(append error html block)
   *
   * @param  {object} error
   * @param  {string} error.field - field name
   * @param  {string} error.body - error body
   * @param  {string} error.token
   * @param  error.params
   *
   * @return {object} this
   */
  showError: function(error, status) {
    if (status === 0) {
      error.body = 'Something went wrong. Please try again';
    }
    if (!error.field && error.body === 'unexpectedError') return this;
    if (_.isObject(error.token)) {
      this.showErrors(error.token, {
        noHideErrors: true
      });
      return this;
    }
    const $fieldMessage = this.getFieldMessageError(error);

    if ($fieldMessage) {
      $fieldMessage
        .append('<div>' + _t(error.body, error.params) + '</div>')
        .addClass('is-visible');
    } else if (this.enableAlerts) {
      vent.trigger('alert:message', error);
    }

    return this;
  },

  getFieldMessageError: function(error) {
    let $fieldMessage;
    if (error.field === null) {
      $fieldMessage = this.getErrorElements().filter('.js-error-form');
    } else {
      $fieldMessage = this.getErrorElements().filter('[data-for=' + error.field + ']');
    }

    if ($fieldMessage.length > 0) {
      return $fieldMessage;
    } else {
      return undefined;
    }
  },

  /**
   * Override FormView.prototype.onChange method
   *
   * Call FormView.prototype.onChange method with function arguments
   * after that call checkForm method and hideErrorOnChange method
   *
   * @param {object} e - DOM event object
   */
  onChange: function(e) {
    FormView.prototype.onChange.apply(this, arguments);
    this.checkForm();
    this.hideErrorOnChange(e);
  },

  /*
   * Override FormView.prototype.onSubmit method
   * If form not valid return false
   * else call FormView.prototype.onSubmit method with function arguments
   *
   * @return {false|undefined}
   * */
  onSubmit: function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.validateForm() === false) return false;
    return FormView.prototype.onSubmit.apply(this, arguments);
  },

  /**
   * Show all errors
   */
  onValidateError: function(errors) {
    this.showErrors(ValidationModel.formatErrors(errors));
  }

});
