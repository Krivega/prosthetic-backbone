'use strict';

const View = require('views/view');
const utils = require('utils');

module.exports = View.extend({

  events: {
    'change .js-time': 'onChangeInputTime'
  },

  /**
   * Convert from HH:MM A
   * @param date
   */
  setDate: function(date) {
    const parts = date.split(/\s/);
    const time = parts[0];
    const suffix = parts[1];

    this.$('.js-time').val(time);
    this.$('.js-suffix').val(suffix);
    return this;
  },

  /**
   * Process input and serialize to HH:MM PM format
   * @returns {string}
   */
  getDate: function() {
    const time = this.$('.js-time').val();
    const suffix = this.$('.js-suffix').val();

    return (time && suffix) ? time + ' ' + suffix : '';
  },

  val: function(date) {
    if (date) return this.setDate(date);
    return this.getDate();
  },

  showError: function() {
    this.trigger('show-error');
    return this;
  },

  hideError: function() {
    this.trigger('hide-error');
    return this;
  },

  validateTime: function() {
    const inputDate = this.getInputTime();
    this.hideError();
    if (!inputDate) {
      this.showError();
      this.$('.js-time').val('');
      return false;
    } else {
      this.$('.js-time').val(inputDate);
      return true;
    }
  },

  getInputTime: function() {
    const validSeparators = [':', '.', ',', ' ', '-'];
    const formatSeparator = ':';
    const valTime = this.$('.js-time').val();
    if (!valTime) return '';

    let timeParts;

    for (let i = 0; i < validSeparators.length; i++) {
      timeParts = valTime.split(validSeparators[i]);
      if (timeParts.length === 2) break;
    }
    if (timeParts.length === 1) {
      timeParts = '' + utils.getOnlyNumber(timeParts[0]);
      if (timeParts.length < 3 || timeParts.length > 4) return '';
      if (timeParts.length === 3) {
        timeParts = '0' + timeParts;
      }
      timeParts = [timeParts.slice(0, 2), timeParts.slice(-2)];
    }

    for (let i = 0; i < timeParts.length; i++) {
      timeParts[i] = '' + utils.getOnlyNumber(timeParts[i]);
      let diffDigits = 2 - timeParts[i].length;
      if (diffDigits > 0) {
        for (let j = 0; j < diffDigits; j++) {
          timeParts[i] = '0' + timeParts[i];
        }
      }
    }
    const time = timeParts.join(formatSeparator);
    if (timeParts.length !== 2 || !this.isValidInputTime(time)) return '';

    return time;
  },

  isValidInputTime: function(time) {
    let isValid = true;
    const re = /^(?:0?\d|1[012]):[0-5]\d$/;
    this.hideError();
    if (!!time && !time.match(re)) {
      this.showError();
      isValid = false;
    }
    return isValid;
  },

  onChangeInputTime: function(e) {
    if (!this.validateTime()) {
      e.stopPropagation();
    }
    this.trigger('change', this.val());
  }

});
