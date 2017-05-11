'use strict';

const _ = require('underscore');
const ValidationForm = require('views/application/validation-form');
const CaptchaView = require('views/ui/captcha');
const PhoneFieldGenerator = require('views/ui/phone-field/phone-field-generator');
const DatePickerSelectGenerator = require('views/ui/datepicker-select-generator');

const template = require('elements/form-constructor/templates/form-constructor.nunj');

module.exports = ValidationForm.extend({

  enableAlerts: true,
  waitForReload: true,

  events: _.extend({}, ValidationForm.prototype.events, {
    'click .js-save': 'onSubmit'
  }),

  template: template,

  initialize: function() {
    ValidationForm.prototype.initialize.apply(this, arguments);

    this.captchaView = new CaptchaView({
      form: this
    });

    this.datepickers = new DatePickerSelectGenerator({
      $el: this.$el,
      fieldModels: this.model.getDateFields()
    });

    this.phoneFields = new PhoneFieldGenerator({
      $el: this.$el,
      fieldModels: this.model.getPhoneFields()
    });
  },

  render: function() {
    this.renderTemplate();
    this.initMasks();
    this.subRender('.js-captcha', this.captchaView);

    this.setElementToSubView(this.$el, this.datepickers).render();
    this.setElementToSubView(this.$el, this.phoneFields).render();

    this.toggleBlocks();
    this.saveFormState();
    return this.renderDone();
  },

  serialize: function() {
    let data = ValidationForm.prototype.serialize.apply(this, arguments);

    data.captcha = this.captchaView.val();
    data = _.omit(data, this.captchaView.getPrivateFieldsNames());

    _.extend(data, this.phoneFields.serialize());

    // datepickers are serialized in super 'masked-form.js'

    return data;
  },

  toggleBlocks: function() {
    this.$('.js-captcha-block').toggleClass('is-hidden', !this.model.hasCaptchaField());
  },

  /**
   * @override
   * Avoid this function in super 'masked-form.js'.
   * All logic moved to DatePickerSelectGenerator
   */
  createDatepicker: function() {},

  showError: function(error) {
    if (this.datepickers.showError(error) || this.phoneFields.showError(error)) {
      return this;
    }
    ValidationForm.prototype.showError.apply(this, arguments);
  },

  getErrorElements: function() {
    const $errors = this.$('.js-error');
    this.phoneFields.avoidErrorElements($errors);
    return $errors;
  }

});
