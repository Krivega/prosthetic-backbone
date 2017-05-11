'use strict';

const _ = require('underscore');
const PhoneFieldView = require('./phone-field');
const FieldsGeneratorBase = require('views/application/fields-generator');

module.exports = FieldsGeneratorBase.extend({

  ChildView: PhoneFieldView,
  childSelectorBase: '.js-phone-field',

  getChildOptions: function(model) {
    const name = model.get('name');
    let label = _t(model.get('token'));

    if (model.get('optional')) {
      label += ' (optional)';
    }

    return {
      label,
      phoneNumberName: name,
      phoneCountryCodeName: `${name}CountryCode`
    };
  },

  serialize: function() {
    const data = {};
    _.each(this.fields, (view) => {
      data[view.getPhoneNumberName()] = view.getPhoneNumberVal();
      data[view.getPhoneCountryCodeName()] = view.getPhoneCountryCodeVal();
    });
    return data;
  },

  avoidErrorElements: function($errors) {
    _.each(this.fields, (view) => {
      $errors = $errors.not(view.$('.js-error'));
    });
  }

});
