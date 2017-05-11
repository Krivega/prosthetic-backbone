'use strict';

var Model = require('../model');

var COUNTRY_USA = 'US';

module.exports = Model.extend({

  getValidatedRules: function() {
    var validatedRules = {};
    var rule = this.get('validation');
    var name = this.get('name');

    if (rule) {
      validatedRules[name] = rule;
    }

    return validatedRules;
  },

  getField: function() {
    var field = {
      name: this.get('name'),
      type: this.get('type'),
      token: this.get('token'),
      grid: this.get('grid')
    };
    var options = this.get('options');
    var rule = this.get('validation');
    var isRequired = rule && rule.indexOf('required') !== -1;
    field.optional = !isRequired;
    if (options) field.options = options;
    if (field.name === 'country' && lang === 'en-us') {
      field.selected = COUNTRY_USA;
    }
    return field;
  }

});
