'use strict';

const moment = require('moment');
const datetimeFormats = require('./datetime-formats');
const tz = require('./datetime-timezone');

moment.fn.getTime = moment.fn.valueOf;

const DATE_ERROR = 'Invalid date format %date. Should be %format.';

// Setup moment for relative times
moment.updateLocale('en', {
  relativeTime: {
    future: '%s left',
    past: '%s ago',
    s: 'sec',
    m: '1min',
    mm: '%dmin',
    h: '1h',
    hh: '%dh',
    d: '1d',
    dd: '%dd',
    M: '1mo',
    MM: '%dmo',
    y: '1yr',
    yy: '%dyr'
  },
  monthsShort: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
  ]
});

/**
 * @mixin datetimeMixin
 * */
module.exports = {

  createDate: function(value, format, strict, timezoneName) {
    // if value is an moment object and no custom timezone entered - just create a clone of a date.
    // This check prevents unexpected timezone changes.
    // E.g: You create date with specific tz, than you call createDate and pass already created
    //      object, without timezone - we need to keep already set timezone
    //      but not to reset it with default
    if (!timezoneName && moment.isMoment(value)) {
      return moment(value);
    }
    timezoneName = timezoneName || tz.timezoneFullName(this.getLang());
    if (value === String(Number(value))) value = Number(value);
    const iso = moment.tz(value, datetimeFormats.getServerFormat(), true, timezoneName);
    if (iso.isValid()) return iso;
    return moment.tz(value, format, !!strict, timezoneName);
  },

  /**
   * @param {number} date
   */
  createDateFromTimeStamp: function(date) {
    return this.createDate(date * 1000);
  },

  changeDateTimezone: function(date, timezone) {
    return this.createDate(date.valueOf(), undefined, undefined, timezone);
  },

  /**
   * @description Convert date string to client locale representation
   * to show formatted date with timezone - use suffix '-tz' in format name.
   */
  formatDate: function(value, format, timezoneName) {
    if (!value) return '';
    const date = this.createDate(value, undefined, undefined, timezoneName);
    if (datetimeFormats.isTimestamp(format)) return date.valueOf();
    const template = this.getFormatTemplate(format);
    let formattedDate = date.format(template);
    if (datetimeFormats.needToShowTimezone(format)) {
      formattedDate += ' ' + this.getTzAbr(date, {
        timezoneName: timezoneName
      });
    }
    return formattedDate;
  },

  isServerRuntime: function() {
    return typeof window === 'undefined';
  },

  getTimezone: function(date, options) {
    if (date && date.toISOString) {
      return tz.dateTimeZone(date.toISOString(), this.getLang(), options);
    }

    return tz.currentTimezone(this.getLang());
  },

  getTimezoneFullName: function() {
    return tz.timezoneFullName(this.getLang());
  },

  getCurrentUtcOffset: function() {
    return this.getUtcOffset();
  },

  getUtcOffset: function(date) {
    if (date && date.toISOString) return tz.dateUTCOffset(date.toISOString(), this.getLang());
    return tz.currentUTCOffset(this.getLang());
  },

  getDatePickerFormatParts: function() {
    return datetimeFormats.getDatePickerFormatParts();
  },

  getDatePickerSeparatorFormat: function() {
    return datetimeFormats.getDatePickerSeparatorFormat();
  },

  getDatePickerFormat: function(options) {
    return datetimeFormats.getDatePickerFormat(options);
  },

  getDatePickerFullFormat: function() {
    return datetimeFormats.getDatePickerFullFormat();
  },

  getDateMask: function() {
    return datetimeFormats.translate('datetimeDateMask');
  },

  isValidDate: function(date, format, strict) {
    return this.createDate(date, format, strict).isValid();
  },

  toValidDate: function(date, format) {
    return this.isValidDate(date, format) ? this.createDate(date, format).format(format) :
      false;
  },

  /**
   * @description Convert date string to server representation
   */
  formatDateToServer: function(dateString, isPicker) {
    const SERVER_DATE_FORMAT = datetimeFormats.getServerFormat();
    // Check if date in server format already
    if (this.isValidDate(dateString, SERVER_DATE_FORMAT, true)) {
      return dateString;
    } else if (isPicker) {
      return this._convertDateFormat(dateString, SERVER_DATE_FORMAT, this.getDatePickerFormat());
    } else {
      return this._convertDateFormat(
        dateString, SERVER_DATE_FORMAT, this.getFormatTemplate()
      );
    }
  },

  /**
   * @description Convert instance of Date to client locale representation
   */
  formatDateObject: function(dateObject, format) {
    format = this.getFormatTemplate(format);
    return moment(dateObject).format(format);
  },

  unixTime: function(value, options) {
    let format;
    options = options || {};
    if (options.picker) format = this.getDatePickerFormat() + ' h:mm A';
    return this.createDate(value, format).unix();
  },

  getFormatTemplate: function(format) {
    return datetimeFormats.getFormatTemplate(format);
  },

  /**
   * @description Return milliseconds from formatted date
   *
   * @param  {string} value  Date formatted
   * @param  {string} format Current format
   * @return {integer}       Milliseconds
   */
  time: function(value, format) {
    if (format) format = this.getFormatTemplate(format);
    if (datetimeFormats.isTimestamp(format)) return this.createDate(value).valueOf();

    return this.createDate(value, format).valueOf();
  },

  /**
   * @description Return UNIX timestamp from formatted date
   */
  getTimestamp: function(value, format) {
    return Math.floor(this.time(value, format) / 1000);
  },

  getTzAbr: function(date, options) {
    return this.getTimezone(date, options);
  },

  normaliseDate: function(date) {
    if (date) {
      if (date instanceof moment) {
        date.hours(0).minutes(0).seconds(0);
      } else {
        date.setHours(0, 0, 0, 0);
      }
    }

    return date;
  },

  createDateNormalised: function(date) {
    date = this.createDate(date);
    date.hours(0).minutes(0).seconds(0);
    return date;
  },

  /**
   * @description Wrapper on moment.fromNow(X) function
   *
   * @param  {string} date
   * @param  {object?} options
   * @return {string}
   */
  fromNow: function(date, options) {
    options = options || {};
    const m = this._toMoment(date);
    if (options.onlyPast && m.isAfter()) {
      return 'now';
    }
    return m.fromNow();
  },

  /**
   * @description Check if date in server format
   */
  isServerDateFormat: function(dateString) {
    const SERVER_DATE_FORMAT = datetimeFormats.getServerFormat();
    return this.isValidDate(dateString, SERVER_DATE_FORMAT);
  },

  betweenDays: function(date1, date2) {
    date1 = this.createDate(date1);
    date2 = this.createDate(date2);
    return date2.diff(date1, 'days');
  },

  betweenDates: function(date1, date2) {
    const arrBetween = [];

    date1 = this.convertMomentToNativeDate(date1);
    date2 = this.convertMomentToNativeDate(date2);

    while (date1 < date2) {
      arrBetween.push(this.cloneDate(date1));
      date1.setTime(date1.getTime() + 1 * 86400000);
    }
    return arrBetween;
  },

  cloneDate: function(date) {
    return new Date(date.setTime(date.getTime()));
  },

  /**
   * @description Return years passed since specified date
   *
   * @param  {Date} date
   * @return {number}
   */
  yearsSince: function(date) {
    const diff = new Date();
    diff.setTime(Date.now() - date.getTime());

    // Date obj begins from 1970
    return diff.getFullYear() - 1970;
  },

  isOlderThan: function(dob, age) {
    const date = this.createDate(dob);
    return this.yearsSince(date) >= age;
  },

  isYoungerThan: function(dob, age) {
    const date = this.createDate(dob);
    return this.yearsSince(date) < age;
  },

  /**
   * @description Converts moment date object to native Date, by creating new Date object.
   * Returned date is created in real browser defined timezone,
   *      but keeps time that it is set with defined user timezone
   *
   * @param momentDate
   * @returns {Date}
   */
  convertMomentToNativeDate: function(momentDate) {
    if (!moment.isMoment(momentDate)) {
      return momentDate;
    }
    return new Date(
      momentDate.get('year'),
      momentDate.get('month'),
      momentDate.get('date'),
      momentDate.get('hour'),
      momentDate.get('minute'),
      momentDate.get('second'),
      momentDate.get('millisecond')
    );
  },

  convertNativeDateToMoment: function(date) {
    if (!(date instanceof Date)) {
      return date;
    }
    return this.createDate({
      year: date.getFullYear(),
      month: date.getMonth(),
      date: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      millisecond: date.getMilliseconds()
    });
  },

  /**
   * @description Convert timestamp or yyyy-mm-dd to moment object
   *
   * @param {object} value
   * @returns {object} Moment date object
   */
  _toMoment: function(value) {
    if (value instanceof Date || typeof value === 'number' || !isNaN(value)) {
      return this.createDate(value);
    }
    const SERVER_DATE_FORMAT = datetimeFormats.getServerFormat();
    const date = this.createDate(value, SERVER_DATE_FORMAT);
    if (!date.isValid()) {
      throw DATE_ERROR.replace('%date', value).replace('%format', SERVER_DATE_FORMAT);
    }
    return date;
  },

  /**
   * @description Convert date format
   *
   * @param {(string | object)} value - it can be moment date object, timestamp, or string date
   * @param {string} destFormat - Destination format
   * @param {string} currentFormat - Current format of value. Default is server format
   * @return {string}
   */
  _convertDateFormat: function(value, destFormat, currentFormat) {
    if (!value) return '';

    const date = this.createDate(value, currentFormat, true);
    if (!date.isValid()) {
      return '';
      // throw DATE_ERROR.replace('%date', value).replace('%format', currentFormat);
    }
    return date.format(destFormat);
  }

};
