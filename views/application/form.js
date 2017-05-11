/**
 *  Base Form view
 */
'use strict';

const _ = require('underscore');
const utils = require('utils');
const View = require('views/view');
const FormState = require('./form-handlers/form-state');
const keycodeHandler = require('libs/keycode-handler');
const EmailFieldHandler = require('./form-handlers/email-field-handler');

/**
 * @class Form
 * @augments BaseView
 * @description Base class for forms
 * @property {boolean}  setOnChange - set serialize data to model for each change form
 * @property {boolean}  resetOnChange - reset serialize data to model for each change form
 * @property {boolean}  waitForReload - do not remove loader after success until
 * the page will be reloaded
 * @property {boolean}  serializeOnlyVisible - serilize only visible data
 * @property {boolean}  serializeAndDisabled - serilize data with disabled elements
 * @property {FormState}  formState
 */
module.exports = View.extend({
  setOnChange: false,
  resetOnChange: false,
  waitForReload: false,
  serializeOnlyVisible: false,
  serializeAndDisabled: false,
  changeEventHandlers: null,
  _isDisabledHandleFormState: false,

  events: {
    submit: 'onSubmit',
    reset: 'onReset',
    'change textarea': 'onChange',
    'change select': 'onChange',
    'change input': 'onChange',
    'keyup input, textarea': 'onKeyupInput',
    'click .js-cancel': 'onCancel'
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.initFormState();
    this.initEmailChangeEventHandler();
    this.listenTo(this.model, 'destroy', this.onSuccessRemove);
    this.listenTo(this, 'overlay:close', this.onOverlayClose);
  },

  initFormState: function() {
    this.formState = new FormState({
      form: this
    });
  },

  initEmailChangeEventHandler: function(fields = ['email']) {
    this.addChangeEventHandler(new EmailFieldHandler(fields));
  },

  addChangeEventHandler: function(handler) {
    this.changeEventHandlers = this.changeEventHandlers || [];
    this.changeEventHandlers.push(handler);
  },

  handleChangeEvent: function(e) {
    if (!this.changeEventHandlers) return this;
    this.changeEventHandlers.forEach(handler => handler.handle(e));
    return this;
  },

  /**
   * Check exist model
   */
  hasModel: function() {
    return !!this.model;
  },

  /**
   * Returns options
   */
  getOptions: function() {
    return {
      wait: true,
      validate: true,
      success: this.onSuccess.bind(this),
      error: this.onError.bind(this)
    };
  },

  /**
   * Save form state to check whether form has changed data
   */
  saveFormState: function() {
    return !this._isDisabledHandleFormState && this.formState.saveState();
  },

  /**
   * If state was saved before it will be updated
   */
  updateFormState: function() {
    return !this._isDisabledHandleFormState && this.formState.updateState();
  },

  /**
   * Removes form state
   */
  removeFormState: function() {
    this.formState.removeState();
  },

  /**
   * This method is used by {FormStateHandler}
   * @returns {Object}
   */
  getStateData: function() {
    return this.serialize();
  },

  isFormStateChanged: function() {
    return this.formState.isFormStateChanged();
  },

  disableHandleFormState: function() {
    this._isDisabledHandleFormState = true;
    this.removeFormState();
    return this;
  },

  remove: function() {
    this.removeFormState();
    return View.prototype.remove.apply(this, arguments);
  },

  /**
   *  Serialize form to object
   *
   *  @return {object} Serialized form
   */
  serialize: function() {
    return utils.serializeObject(this.$el, {
      visible: this.serializeOnlyVisible,
      disabled: this.serializeAndDisabled
    });
  },

  /**
   *  Set Serialized form to model
   *
   *  @param {object} options - model options
   */
  serializeToModel: function(options) {
    const data = this.serialize();
    this.model.set(data, _.extend({
      silent: true
    }, options));
  },

  /**
   * Clear model and set Serialized form to model
   * Remove this method after implementing correct checkbox handling with setOnChange
   *
   * @param {object} options
   */
  serializeToModelReset: function(options) {
    this.model.clear({
      silent: true
    });
    this.serializeToModel(options);
  },

  /**
   * Fill form elements
   *
   * @param {object} data
   * @return {object} data parameter
   */
  fill: function(data) {
    if (!data && this.model) {
      data = this.model.getTemplateData();
    }
    utils.fillForm(this.$el, data);

    return data;
  },

  /**
   * Disable double submit on sync time
   * and call callback function
   *
   * @param {function} callback
   * @param {object?} options
   * @return {*}
   */
  enterSyncState: function(callback, options) {
    // Prevent double submit
    if (this._isSync) return false;
    this._isSync = true;
    this._disableSubmit();
    return callback.call(this, options);
  },

  /**
   * Enable submit button and set the sync state property to false
   *
   * @return {object} this
   */
  exitSyncState: function() {
    this._isSync = false;
    this._enableSubmit();
    return this;
  },

  /**
   * Check sync state
   *
   * @return {boolean}
   */
  isSyncState: function() {
    return this._isSync;
  },

  showErrors: function() {},

  hideErrors: function() {},

  /**
   * Triggered submit event
   *
   * @return {object} this
   */
  submit: function() {
    this.getFormElement().trigger('submit');
    return this;
  },

  /**
   * Triggered reset event
   *
   * @return {object} this
   */
  reset: function() {
    this.getFormElement().trigger('reset');
    return this;
  },

  /**
   * Call blur method of input element
   *
   * @return {object} this
   */
  blur: function() {
    this.$(':input:focus').blur();
    return this;
  },

  /**
   * Get form element
   *
   * @return {object} form element
   */
  getFormElement: function() {
    return this.$el.is('form') ? this.$el : this.$('form');
  },

  /**
   * Action taken on submit
   *
   * @param {object} extOptions - extend options
   * @return {(boolean|object)} xhr or false
   */
  _save: function(extOptions) {
    extOptions = extOptions || {};
    const data = this.serialize();
    let options = this.getOptions();
    options = _.extend(options, extOptions);
    let xhr;
    if (this.hasModel()) {
      xhr = this.model.save(data, options);
    } else {
      xhr = this.collection.create(data, options);
    }
    if (xhr) return xhr;
    this.exitSyncState();
    return false;
  },

  /**
   * Call _save method with options argument
   *
   * @param {object?} options
   * @return {(boolean|object)} form element
   */
  save: function(options) {
    return this.enterSyncState(this._save, options);
  },

  /**
   * Focuses on the first element of the form
   *
   * @returns {object} this
   */
  focus: function() {
    this.$('input, select').first().focus();
    return this;
  },

  /**
   * Disable submit button
   */
  _disableSubmit: function() {
    this.getSubmitButton()
      .prop('disabled', true)
      .addClass('is-loading');
  },

  /**
   * Enable submit button
   */
  _enableSubmit: function() {
    this.getSubmitButton()
      .prop('disabled', false)
      .removeClass('is-loading');
  },

  /**
   * Focuses on the first input of the form
   */
  focusOnFirstInput: function() {
    this.$('input:first').focus();
    return this;
  },

  /**
   * Get waitForReload Form property
   */
  needToWaitForReload: function() {
    return this.waitForReload;
  },

  /**
   * Get submit button
   */
  getSubmitButton: function() {
    return this.$(':submit');
  },

  isForm: function() {
    return true;
  },

  // Events

  /**
   * @param {object} e - DOM event object
   */
  onChange: function(e) {
    if (e && e.stopPropagation && !keycodeHandler.isEscapeKeyEvent(e)) {
      e.stopPropagation();
    }
    this.handleChangeEvent(e);
    if (this.setOnChange === true) this.serializeToModel();
    if (this.resetOnChange === true) this.serializeToModelReset();
    this.trigger('change', this);
  },

  onKeyupInput: function(e) {
    return this.onChange(e);
  },

  /**
   * event call blur and save methods when triggered
   *
   * @param {object} e - DOM event object
   */
  onSubmit: function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.blur();
    this.save();
  },

  /**
   * event call hideErrors method and triggered reset event
   *
   * @param {object} e - DOM event object
   */
  onReset: function(e) {
    // Don't propagete this event to parent views
    e.stopPropagation();
    this.hideErrors();
    this.trigger('reset');
  },

  /**
   * @param {object} model
   */
  onSuccess: function(model) {
    this.exitSyncState().hideErrors();
    if (this.needToWaitForReload()) this._disableSubmit();
    this.updateFormState();
    this.trigger('success', model);
  },

  /**
   * @param {object} model
   * @param {object} errors
   */
  onError: function(model, errors) {
    const errorData = utils.formatErrors(errors);
    this.exitSyncState().showErrors(errorData);
    this.trigger('error', model, errorData);
  },

  onSuccessRemove: function() {
    this.formState.removeState();
  },

  /**
   * Triggered cancel method with model as argument
   */
  onCancel: function() {
    this.updateFormState();
    this.trigger('cancel', this.model);
  },

  onOverlayClose: function() {
    this.removeFormState();
  }

});
