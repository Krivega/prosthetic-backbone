'use strict';

const utils = require('utils');
const View = require('views/view');
const countryPhoneCodes = require('./../_helpers/country-phone-codes');
const currentUser = require('runtime/current-user');

const template = require('ui/phone-field/templates/country-codes-select.nunj');

module.exports = View.extend({

  template: template,
  events: {
    'change .js-country-code-select': 'onChange'
  },

  value: null,

  defaultOptions: {
    name: 'countryPhoneCode',
    mods: ''
  },

  render: function() {
    this.renderTemplate(this.getRenderData());
    return this.renderDone();
  },

  getRenderData: function() {
    return {
      phoneCodes: countryPhoneCodes.getMapped(),
      name: this.options.name,
      selected: this.getSelected()
    };
  },

  $select: function() {
    return this.$('.js-country-code-select');
  },

  val: function(value) {
    if (value !== undefined) {
      this.value = value;
      return this.setSelected(value);
    }
    return countryPhoneCodes.getPhoneCodeByCountry(this.getSelectedCountryCode());
  },

  reset: function() {
    this.val(this.getDefaultValue());
  },

  getSelectedCountryCode: function() {
    return this.$select().val();
  },

  convertPhoneCodeToCountry: function(phoneCode) {
    // use default value if phoneCode is empty
    phoneCode = phoneCode || this.getDefaultValue();
    return countryPhoneCodes.getCountryByPhoneCode(phoneCode);
  },

  setSelected: function(value) {
    // TODO: HOTFIX for set selected hidden(invisible) <select>
    this.$select()[0].value = this.convertPhoneCodeToCountry(value);
    return this;
  },

  getSelected: function() {
    const phoneCode = this.value || this.getDefaultValue();
    return this.convertPhoneCodeToCountry(phoneCode);
  },

  getDefaultValue: function() {
    const lang = utils.getLang();
    let countryCode = 'US';
    if (lang === 'en-gb') {
      countryCode = 'GB';
    } else if (lang === 'en' && currentUser.getCountryCode()) {
      countryCode = currentUser.getCountryCode();
    }
    return countryPhoneCodes.getPhoneCodeByCountry(countryCode);
  },

  disable: function(disabled) {
    this.$select().prop('disabled', disabled);
  },

  onChange: function() {
    this.trigger('change');
  }

});
