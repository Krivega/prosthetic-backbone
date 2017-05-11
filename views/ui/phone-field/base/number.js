'use strict';

const _ = require('underscore');
const utils = require('utils');
const View = require('views/view');
const countryPhoneCodes = require('./../_helpers/country-phone-codes');

require('plugins/jquery.maskedinput');
const template = require('ui/phone-field/templates/phone-number-input.nunj');

module.exports = View.extend({

  template,
  isMask: false,

  events: {
    'keyup .js-phone-number-input input': 'onInputKeyup',
    click: 'onInputClick'
  },

  defaultOptions: {
    mods: '',
    placeholder: ''
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.options = _.defaults(this.options, this.defaultOptions);
  },

  render: function() {
    this.renderTemplate(this.getRenderData());
    return this.renderDone();
  },

  getRenderData: function() {
    return {
      name: this.options.name,
      placeholder: this.options.placeholder,
      mods: this.options.mods,
      value: this.options.value
    };
  },

  setMaskByCountryCode: function(countryCode) {
    const mask = countryPhoneCodes.phoneMasksByCountryCode(countryCode);

    if (!this.isInputRendered()) {
      return this;
    }
    this.clearNumberMaskFormatting();
    if (mask) {
      this.$input().mask(mask);
    } else {
      this.$input().unmask();
    }
    this.isMask = !!mask;
    return this;
  },

  isInputRendered: function() {
    return !!this.$input().length;
  },

  clearNumberMaskFormatting: function() {
    const notFormattedNumber = this.$input().mask();
    if (notFormattedNumber) {
      this.val(this.$input().mask());
    }
  },

  $input: function() {
    return this.$('.js-phone-number-input input');
  },

  reset: function() {
    this.val('');
  },

  val: function(value) {
    if (value !== undefined) {
      return this.$input().val(value);
    }
    return this.getValue();
  },

  disable: function(disabled) {
    this.$input().prop('disabled', disabled);
  },

  getValue: function() {
    return this.$input().val();
  },

  onInputKeyup: function() {
    this.trigger('keyup');
  },

  onInputClick: function() {
    if(!this.isMask){
      return;
    }
    const $input = this.$input();
    const notFormattedNumber = $input.mask();
    if (!notFormattedNumber) {
      if (!$input.is(':focus')) {
        $input.focus();
      }
      utils.setCaret($input[0], {
        start: 1,
        end: 1
      });
    }
  }

});
