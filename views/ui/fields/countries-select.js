'use strict';

const View = require('views/view');
const CountriesDataModel = require('models/elements/address/countries-data');

const template = require('views/ui/fields/countries-select.nunj');

module.exports = View.extend({

  template,

  events: {
    'change .js-countries-select': 'onCountryChange'
  },

  defaultOptions: {
    label: _t('country'),
    name: 'country',
    mods: [],
    detached: false,
    firstName: _t('selectCountry')
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.model = new CountriesDataModel();

    this.model.load();
    this.listenTo(this.model, 'sync', this.render);
  },

  render: function() {
    this.renderData({
      label: this.options.label,
      name: this.options.name,
      mods: this.options.mods,
      detached: this.options.detached,
      firstName: this.options.firstName,
      countries: this.model.get('countries') || []
    });
    return this.renderDone();
  },

  val: function(value) {
    if (value === undefined) {
      return this.getValue();
    }
    this.setValue(value);
    return this;
  },

  getValue: function() {
    return this.$('.js-countries-select').val();
  },

  setValue: function(value) {
    return this.$('.js-countries-select').val(value);
  },

  onCountryChange: function() {
    this.trigger('change', this.getValue());
  }

});

