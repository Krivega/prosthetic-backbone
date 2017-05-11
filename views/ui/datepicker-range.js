'use strict';

const utils = require('utils');
const _ = require('underscore');
const View = require('views/view');
const convert = require('libs/convert-utils');
const DatepickerView = require('views/ui/datepicker');

const DAY_IN_SECONDS = 86400;

module.exports = View.extend({

  initialize: function(options) {
    View.prototype.initialize.apply(this, arguments);
    options = options || {};
    this.optionsStart = options.optionsStart;
    this.optionsEnd = options.optionsEnd;
    this.minDays = options.minDays || 0;
  },

  render: function($inputStart, $inputEnd, options = {}) {
    this.datepickerStart = (new DatepickerView(_.extend({
      el: $inputStart
    }, this.optionsStart))).render(options.from);

    this.datepickerEnd = (new DatepickerView(_.extend({
      el: $inputEnd
    }, this.optionsEnd))).render(options.to);

    this.listenTo(this.datepickerStart, 'change', this.onStartDateChange);
    this.listenTo(this.datepickerEnd, 'change', this.onEndDateChange);

    return this;
  },

  onStartDateChange: function(date) {
    if (!date) return;

    date = utils.convertNativeDateToMoment(date);
    this.trigger('change:start', date);

    const endDate = this.getEndDate();
    date = date.getTime() + convert.unix2ms(DAY_IN_SECONDS * this.minDays);

    this.datepickerEnd.setOptions({
      minDate: utils.convertMomentToNativeDate(utils.createDate(date))
    });

    if (endDate && endDate > date) {
      this.setRangeDuration();
      return;
    }
    this.setEndDate(date);
  },

  onEndDateChange: function(date) {
    if (!date) return;
    date = utils.convertNativeDateToMoment(date);
    this.setRangeDuration();
    this.trigger('change:end', date);
  },

  setRangeDuration: function() {
    const selectStartDate = this.getStartDate();
    const selectEndDate = this.getEndDate();
    if (!selectStartDate) return;
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

    const diffDays = Math.round(Math.abs(
      (selectStartDate.getTime() - selectEndDate.getTime()) / (oneDay)
    )) + 1; // for include start and end dates

    selectEndDate.subtract(1, 'day');

    this.datepickerEnd.setHighlighted({
      startDate: utils.convertMomentToNativeDate(selectStartDate),
      endDate: utils.convertMomentToNativeDate(selectEndDate)
    });

    this.trigger('setRangeDuration', diffDays);
  },

  setStartDate: function(date, options) {
    return this.datepickerStart.val(date, options);
  },

  setEndDate: function(date, options) {
    return this.datepickerEnd.val(date, options);
  },

  getStartDate: function() {
    return this.datepickerStart.val();
  },

  getEndDate: function() {
    return this.datepickerEnd.val();
  },

  getStartDateFormatted: function() {
    return this.datepickerStart.getDateFormatted();
  },

  getEndDateFormatted: function() {
    return this.datepickerEnd.getDateFormatted();
  },

  /**
   * Returns Unix timestamp of <START-DATE> 0:00:00
   * @return {number}
   */
  getStartTimestamp: function() {
    let date = this.datepickerStart.val();

    if (date) {
      date = utils.normaliseDate(date);
      return convert.ms2unix(date.getTime());
    } else {
      return date;
    }
  },

  /**
   * Returns Unix timestamp of <END-DATE> 23:59:59
   * @return {number}
   */
  getEndTimestamp: function() {
    let date = this.datepickerEnd.val();

    if (date) {
      date = utils.createDate(date.valueOf() + convert.unix2ms(DAY_IN_SECONDS - 1));
      return convert.ms2unix(date.valueOf());
    } else {
      return date;
    }
  },

  val: function(dates, endDate) {
    if (dates) {
      if (!_.isArray(dates)) {
        dates = [dates];
        if (endDate) {
          dates.push(endDate);
        }
      }
      if (dates[0]) this.datepickerStart.val(dates[0]);
      if (dates[1]) this.datepickerEnd.val(dates[1]);
      return this;
    }
    return [this.datepickerStart.val(), this.datepickerEnd.val()];
  }
});
