'use strict';

require('plugins/jquery.maskedinput');

const utils = require('utils');
const View = require('views/view');
const keycodeHandler = require('libs/keycode-handler');

module.exports = View.extend({

  events: {
    'keydown .js-time-hours': 'onHoursKeyDown',
    'keyup .js-time-hours': 'onHoursKeyUp',
    'change .js-time-hours': 'onChangeHours',
    'blur .js-time-hours': 'onChangeHours'
  },

  render: function() {
    this.$('.js-time-minutes').each((index, el) => {
      this.$(el).mask('M?9', {
        placeholder: ''
      });
    });
    return this;
  },

  /**
   * Convert from HH:MM A
   * @param date
   */
  setDate: function(date) {
    const parts = date.split(/\s/);
    const time = parts[0];
    const hours = time.split(':')[0];
    const minutes = time.split(':')[1];
    const suffix = parts[1];
    this.$('.js-time-hours').val(hours);
    this.$('.js-time-minutes').val(minutes);
    this.$('[name=timeSuffix]').val(suffix);
    return this;
  },

  /**
   * Process input and serialize to HH:MM PM format
   * @returns {string}
   */
  getDate: function() {
    const hours = this.$('.js-time-hours').val();
    const minutes = this.$('.js-time-minutes').val();
    const suffix = this.$('[name=timeSuffix]').val();
    if (!hours || !minutes || !suffix) return '';
    const time = hours + ':' + minutes;
    return time + ' ' + suffix;
  },

  val: function(date) {
    if (date) return this.setDate(date);
    return this.getDate();
  },

  validateHoursInput: function(input) {
    if (!this.isValidHours(input.value)) {
      input.value = '';
      return false;
    }
    return true;
  },

  isAllowedKeyEvent: function(e) {
    if (keycodeHandler.isNumberKeyEvent(e)) return true;
    if (keycodeHandler.isArrowKeyEvent(e)) return true;
    if (keycodeHandler.isSpecificKeyEvent(e)) return true;
    return keycodeHandler.isCopyPasteKeys(e);
  },

  isValidHours: function(value) {
    if (!/\d+/.test(value)) return false;
    if ((value + '').length > 2) return false;
    if (value < 0) return false;
    if (value === '00') return false;
    return value <= 12;
  },

  getPredictedInputValue: function(e) {
    const caret = utils.getCaret(e.currentTarget);
    const enteredNumber = keycodeHandler.numberFromKeyEvent(e);
    const currentValue = e.currentTarget.value;
    const numbers = currentValue.split('');
    numbers.splice(caret.start, 0, enteredNumber);
    return numbers.join('');
  },

  onHoursKeyDown: function(e) {
    let value;
    if (keycodeHandler.hasBugsBrowserEvent(e)) return;

    if (!this.isAllowedKeyEvent(e)) {
      e.stopPropagation();
      e.preventDefault();
      return this;
    }

    if (!keycodeHandler.isNumberKeyEvent(e)) {
      return this;
    }

    value = this.getPredictedInputValue(e);

    if (!this.isValidHours(value)) {
      e.stopPropagation();
      e.preventDefault();
    }
    return this;
  },

  onHoursKeyUp: function(e) {
    this.validateHoursInput(e.currentTarget);
    return this;
  },

  onChangeHours: function(e) {
    this.validateHoursInput(e.currentTarget);
  }

});
