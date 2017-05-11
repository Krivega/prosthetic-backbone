'use strict';

const utils = require('utils');
const _ = require('underscore');
const View = require('views/view');
const convert = require('libs/convert-utils');
const DatepickerSelect = require('views/ui/datepicker-select');

const DAY_IN_SECONDS = 86400;

module.exports = View.extend({

  initialize() {
    View.prototype.initialize.apply(this, arguments);
    this.minDays = this.options.minDays || 0;

    this.datepickerSelectStart = this.createPicker('startDateTime', this.options.optionsStart);
    this.datepickerSelectEnd = this.createPicker('endDateTime', this.options.optionsEnd);

    this.listenTo(this.datepickerSelectStart, 'change', this.onChangeStartDate);
    this.listenTo(this.datepickerSelectEnd, 'change', this.onChangeEndDate);
  },

  createPicker(name, options = {}) {
    options.name = name;
    return new DatepickerSelect(options);
  },

  render($inputStart, $inputEnd) {
    this.datepickerSelectStart.setElement($inputStart).render();
    this.datepickerSelectEnd.setElement($inputEnd).render();
    return this;
  },

  reset() {
    this.datepickerSelectStart.setDate('');
    this.datepickerSelectEnd.setDate('');
  },

  setRangeDuration() {
    const selectStartDate = this.getStartDate();
    const selectEndDate = this.getEndDate();
    if (!selectStartDate) return;
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

    const diffDays = Math.round(Math.abs(
      (selectStartDate.getTime() - selectEndDate.getTime()) / (oneDay)
    )) + 1; // for include start and end dates

    selectEndDate.subtract(1, 'day');

    this.trigger('setRangeDuration', diffDays);
  },

  /**
   * @param {Moment} date
   */
  setEndDate(date) {
    return this.datepickerSelectEnd.val(date);
  },

  getStartDate() {
    return this.datepickerSelectStart.val();
  },

  getEndDate() {
    return this.datepickerSelectEnd.val();
  },

  getDatepickerSelectStart: function() {
    return this.datepickerSelectStart;
  },

  getDatepickerSelectEnd: function() {
    return this.datepickerSelectEnd;
  },

  /**
   * Returns Unix timestamp of <START-DATE> 0:00:00
   * @return {number}
   */
  getStartTimestamp() {
    let date = this.datepickerSelectStart.val();

    if (date) {
      date = utils.normaliseDate(date);
      return convert.ms2unix(date.getTime());
    }
    return date;
  },

  /**
   * Returns Unix timestamp of <END-DATE> 23:59:59
   * @return {number}
   */
  getEndTimestamp() {
    let date = this.datepickerSelectEnd.val();

    if (date) {
      date = utils.createDate(date.valueOf() + convert.unix2ms(DAY_IN_SECONDS - 1));
      return convert.ms2unix(date.valueOf());
    }
    return date;
  },

  val(dates, endDate) {
    if (dates) {
      if (!_.isArray(dates)) {
        dates = [dates];
        if (endDate) {
          dates.push(endDate);
        }
      }
      if (dates[0]) this.datepickerSelectStart.val(dates[0]);
      if (dates[1]) this.datepickerSelectEnd.val(dates[1]);
      return this;
    }
    return [this.datepickerSelectStart.val(), this.datepickerSelectEnd.val()];
  },

  /**
   * @param {Moment} date
   */
  onChangeStartDate(date) {
    if (date) {
      date = date.getTime() + convert.unix2ms(DAY_IN_SECONDS * this.minDays);
      const endDate = this.getEndDate();
      if (!endDate || endDate < date) {
        this.setEndDate(date);
        this.setRangeDuration();
      }
    }
    this.trigger('change:start', date);
  },

  /**
   * @param {Moment} date
   */
  onChangeEndDate(date) {
    if (date) {
      date = utils.convertNativeDateToMoment(date);
      this.setRangeDuration();
    }
    this.trigger('change:end', date);
  }
});
