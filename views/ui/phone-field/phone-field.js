'use strict';

const View = require('views/view');
const CountryCodesView = require('./base/country-codes');
const NumberView = require('./base/number');

const template = require('ui/phone-field/phone-field.nunj');

module.exports = View.extend({

  template: template,

  defaultOptions: {
    detached: false,
    label: 'cellPhoneOptional',
    phoneCountryCodeName: 'phoneCountryCode',
    phoneNumberName: 'phoneNumber',
    fieldName: 'phone' //is to show errors
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.countryCodesView = new CountryCodesView({
      name: this.options.phoneCountryCodeName,
      mods: this.options.phoneCountryCodeMods,
      value: this.options.phoneCountryCode
    });
    this.numberView = new NumberView({
      name: this.options.phoneNumberName,
      mods: this.options.phoneNumberMods,
      placeholder: this.options.placeholder,
      value: this.options.phoneNumber
    });

    this.listenTo(this.numberView, 'keyup', this.onNumberKeyup);
    this.listenTo(this.countryCodesView, 'change', this.onCountryCodeChange);
  },

  render: function() {
    this.renderTemplate(this.getRenderData());
    this.subRender('.js-country-codes-select', this.countryCodesView);
    this.subRender('.js-phone-number-input', this.numberView);
    this.updatePhoneNumberMask();
    return this.renderDone();
  },

  getRenderData: function() {
    return {
      label: this.options.label,
      placeholder: this.options.placeholder,
      mods: this.options.mods,
      detached: this.options.detached,
      fieldName: this.options.fieldName
    };
  },

  val: function(value, noMaskUpdate = false) {
    if (value !== undefined) {
      this.countryCodesView.val(value.phoneCountryCode);
      this.numberView.val(value.phoneNumber);

      if (!noMaskUpdate) {
        this.updatePhoneNumberMask();
      }

      return this;
    }
    return this.getValue();
  },

  reset: function() {
    this.countryCodesView.reset();
    this.numberView.reset();
  },

  /**
   * To disable fields pass disabled=true
   * @param disabled
   */
  disableField: function(disabled) {
    this.countryCodesView.disable(disabled);
    this.numberView.disable(disabled);
  },

  setLabel: function(label) {
    this.options.label = label;
    this.$('.js-field-label').first().text(label);
  },

  getPhoneNumberName: function() {
    return this.options.phoneNumberName;
  },

  getPhoneCountryCodeName: function() {
    return this.options.phoneCountryCodeName;
  },

  updatePhoneNumberMask: function() {
    this.numberView.setMaskByCountryCode(this.countryCodesView.getSelectedCountryCode());
  },

  getPhoneNumberVal: function() {
    return this.numberView.val();
  },

  /**
   * Returns value, if phone number is empty - country code also will be emptied.
   * @returns {String}
   */
  getPhoneCountryCodeVal: function() {
    if (!this.getPhoneNumberVal()) {
      return '';
    }
    return this.countryCodesView.val();
  },

  /**
   * @returns {{phoneCountryCode: string, phoneNumber: string}}
   */
  getValue: function() {
    const data = {};
    data[`${this.options.phoneCountryCodeName}CountryCode`] = this.getPhoneCountryCodeVal();
    data[`${this.options.phoneNumberName}Number`] = this.getPhoneNumberVal();
    return data;
  },

  getErrorElements: function() {
    let $errors = this.$('.js-error');
    $errors = $errors.not(this.numberView.$('.js-error'));
    return $errors;
  },

  $error: function() {
    return this.getErrorElements().filter(`[data-for=${this.options.fieldName}]`);
  },

  showError: function(errorToken) {
    this.$error().toggleClass('is-visible', true).text(_t(errorToken));
  },

  hideError: function() {
    this.$error().toggleClass('is-visible', false).text('');
  },

  onNumberKeyup: function() {
    this.hideError();
  },

  onCountryCodeChange: function() {
    this.updatePhoneNumberMask();
  }

});
