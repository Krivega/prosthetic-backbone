'use strict';

const _ = require('underscore');
const utils = require('utils');
const countries = require('country-data').countries;
/**
 * Main countries USA, Great Britain
 * @type {string[]}
 */
const mainCountries = ['US', 'GB'];
const codes = {};
const phoneCodesByCountry = {};
const countriesByPhoneCode = {};
_.each(countries, (data) => {
  if (_.isEmpty(data.countryCallingCodes)) {
    return;
  }

  let phoneCode = data.countryCallingCodes[0];

  phoneCode = `+${phoneCode}`.replace('++', '+');
  phoneCodesByCountry[data.alpha2] = phoneCode;
  countriesByPhoneCode[phoneCode] = data.alpha2;
  codes[data.alpha2] = {
    value: data.alpha2,
    token: `${data.alpha2} ${phoneCode}`
  };
});

module.exports = {

  getMapped: function() {
    const mainCodes = _.values(_.pick(codes, mainCountries));
    const others = _.values(utils.omit(codes, mainCountries));
    return [{
      name: '---------',
      options: mainCodes
    }, {
      name: '---------',
      options: others
    }];
  },

  getCountryByPhoneCode: function(code) {
    switch (code) {
      // hack since Jersey has also code +44
      case '+44':
        return 'GB';
      default:
        return countriesByPhoneCode[code];
    }
  },

  getPhoneCodeByCountry: function(alpha2) {
    return phoneCodesByCountry[alpha2];
  },

  phoneMasksByCountryCode: function(alpha2) {
    switch (alpha2) {
      case 'US':
        return '(999) 999-9999';
    }
    return '';
  }

};
