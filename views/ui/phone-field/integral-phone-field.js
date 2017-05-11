'use strict';

const PhoneFieldView = require('./phone-field');
const integralPhoneFieldTemplate = require('ui/phone-field/templates/integral-phone-field.nunj');

module.exports = function(options = {}) {
  options.template = integralPhoneFieldTemplate;
  options.phoneNumberMods = ['integral'];
  options.phoneCountryCodeMods = ['integral'];
  return new PhoneFieldView(options);
};
