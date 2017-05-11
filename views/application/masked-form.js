/*
 * Form that supports masked and formatted inputs
 *
 * Mask can be specified as data-attribute, e.g. data-mask="value"
 * Data format is accepted as data-format_date
 */
'use strict';

const $ = require('jquery');
const _ = require('underscore');
const utils = require('utils');
const FormView = require('./form');
const Datepickers = require('views/ui/datepickers');
const convert = require('libs/convert-utils');

module.exports = FormView.extend({

  events: _.extend(FormView.prototype.events, {
    'keyup input[type=number]': 'onInputNumberKeyUp'
  }),

  /**
   * @class MaskedForm
   * @augments Form
   * @description MaskedForm class
   * @constructor
   * @property {object} _phoneMasks
   * @name MaskedForm
   */
  initMasks: function() {
    this.createDatepicker();
    return this;
  },

  /**
   * Create mask for url
   *
   * @return {object} this
   */
  createUrlMask: function() {
    this.$('[type=url]').on('focus.mask' + this.cid, function() {
      if (!this.value) this.value = 'http://';
    });
    this.$('[type=url]').on('blur.mask' + this.cid, function() {
      if ($(this).val() === 'http://') $(this).val('');
    });

    return this;
  },

  remove: function() {
    this.$('[type=url]').off('focus.mask' + this.cid);
    this.$('[type=url]').off('blur.mask' + this.cid);
    return FormView.prototype.remove.apply(this, arguments);
  },

  /**
   * Create picker for all date fields
   */
  createDatepicker: function() {
    this.datepickers = (new Datepickers({
      el: this.$el
    })).render();
  },

  /**
   * Format money value on target
   *
   * @param {object} target - DOM element
   * @param {object} options
   * @return {object} this
   */
  formatInputMoney: function(target, options) {
    if (target.jquery) {
      target = target[0];
    }
    utils.formatInputMoney(target, options);
    return this;
  },

  unFormatInputMoney: function(target, options) {
    if (target.jquery) {
      target = target[0];
    }
    utils.unFormatInputMoney(target, options);
    return this;
  },

  /**
   * Format money value to cents
   */
  unFormatMoneyToCents: function(money, options) {
    if (money) {
      return utils.unFormatMoneyToCents(money, options);
    }
    return money;
  },

  /**
   * convert money value to dollars
   */
  moneyToDollars: function(money) {
    if (money) {
      return convert.cents2usd(money);
    }
    return money;
  },

  /**
   * Formatting input numeric values
   *
   * @param  {object} target - DOM element, like input
   * @return {object} this
   */
  formatInputNumberValue: function(target) {
    utils.formatInputNumberValue(target, {
      suffix: this.$(target).data('suffix'),
      prefix: this.$(target).data('prefix'),
      max: this.$(target).data('max'),
      min: this.$(target).data('min')
    });

    return this;
  },

  /**
   * Serialize this view
   *
   * @return {object} serialized object with formatted dates
   */
  serialize: function() {
    const data = FormView.prototype.serialize.apply(this, arguments);

    // Form uses pickers
    if (this.datepickers) {
      _.extend(data, this.datepickers.getDatesFormatted());
    }
    _.extend(data, this.getFormattedEmails());
    return data;
  },

  getFormattedEmails: function() {
    const emails = {};
    this.$('[name=email],[type=email]').each(function() {
      emails[this.name] = utils.getFormattedEmail(this.value);
    });
    return emails;
  },

  /**
   * Fill form elements
   *
   * @param {object} data
   * @return {object} data argument or model template data
   */
  fill: function(data) {
    if (!data && this.model) {
      data = this.model.getTemplateData();
    }
    if (this.datepickers) this.datepickers.fill(data);

    return FormView.prototype.fill.apply(this, arguments);
  },

  onInputNumberKeyUp: function(e) {
    if (e.currentTarget.value) {
      e.currentTarget.value = +e.currentTarget.value;
    }
  }

});
