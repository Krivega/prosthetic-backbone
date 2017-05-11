'use strict';

const _ = require('underscore');
const DatepickerSelectView = require('./datepicker-select');
const FieldsGeneratorBase = require('views/application/fields-generator');

module.exports = FieldsGeneratorBase.extend({

  ChildView: DatepickerSelectView,
  childSelectorBase: '.js-date-picker-select',

  getChildOptions: function(model) {
    let label = _t(model.get('token'));

    if (model.get('optional')) {
      label += ' (optional)';
    }

    return {
      label,
      name: model.get('name')
    };
  },

  getDateFormatted: function(name) {
    if (!this.fields[name]) return '';
    return this.fields[name].getDateFormatted();
  },

  getDatesFormatted: function() {
    const data = {};
    _.each(this.fields, (view, name) => {
      data[name] = view.getDateFormatted();
    });
    return data;
  }

});
