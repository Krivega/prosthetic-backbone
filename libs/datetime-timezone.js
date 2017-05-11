'use strict';

const jstz = require('jstimezonedetect');
const moment = require('moment-timezone');
let currentUser;

const timezonesByLang = {
  'en-us': 'EST',
  'en-gb': 'GMT',
  en: 'GMT'
};

const timezonesFullNameByLang = {
  'en-us': 'America/New_York',
  'en-gb': 'Europe/London',
  en: 'Europe/London'
};

const utcOffsetsByLang = {
  'en-us': '-0400',
  'en-gb': '+0',
  en: '+0'
};

module.exports = {

  currentTimezone: function(lang) {
    return this._userTimezone() || this._timezoneByLang(lang);
  },

  dateTimeZone: function(dateISO, lang, options) {
    options = options || {};
    if (options.timezoneName) {
      return this._detectDateTimezone(dateISO, options.timezoneName);
    }
    return this._userTimezone(dateISO) || this._timezoneByLang(lang);
  },

  timezoneFullName: function(lang) {
    return this._userTimezoneFullName() || this._timezoneFullNameByLang(lang);
  },

  dateUTCOffset: function(dateISO, lang) {
    return this._userUTCOffset(dateISO) || this._utcOffsetByLang(lang);
  },

  currentUTCOffset: function(lang) {
    return this._userUTCOffset() || this._utcOffsetByLang(lang);
  },

  _userTimezone: function(dateISO) {
    if (this.isServerRuntime()) return false;
    return this._detectCurrentUserTimezone(dateISO, true) ||
      this._detectBrowserTimezone(dateISO) ||
      this._detectMomentTimezone(dateISO, true);
  },

  _userTimezoneFullName: function(dateISO) {
    if (this.isServerRuntime()) return false;
    return this._detectCurrentUserTimezone(dateISO) ||
      this._detectMomentTimezone(dateISO);
  },

  _detectCurrentUserTimezone: function(dateISO, abbr) {
    let tz;
    const user = this._getCurrentUser();
    if (user && user.getTimezone()) {
      tz = currentUser.getTimezone();
      if (abbr) {
        tz = this._getMomentTimezoneAbbr(tz, dateISO);
      }
    }
    return tz;
  },

  _detectBrowserTimezone: function(dateISO) {
    const dateObj = this._getDate(dateISO);
    const match = dateObj.toString().match(/\(([A-Za-z\s].*)\)/);
    const tz = match ? match[1] : '';
    if (!tz || !/[A-Z]/.test(tz)) return '';
    return tz.match(/[A-Z]/g).join('');
  },

  _detectMomentTimezone: function(dateISO, abbr) {
    const tz = jstz.determine().name();
    if (abbr) {
      return this._getMomentTimezoneAbbr(tz, dateISO);
    }
    return tz;
  },

  _detectDateTimezone: function(dateISO, timezoneName) {
    return moment(this._getDate(dateISO)).tz(timezoneName).format('z');
  },

  _timezoneByLang: function(lang) {
    return timezonesByLang[lang];
  },

  _timezoneFullNameByLang: function(lang) {
    return timezonesFullNameByLang[lang];
  },

  _userUTCOffset: function(dateISO) {
    if (this.isServerRuntime()) return false;
    /* if timezone wasn't detected use default offset for lang */
    if (!this._isUserTimezoneDetected()) return false;
    const dateObj = this._getDate(dateISO);
    const match = dateObj.toString().match(/([-\+][0-9]+)/);
    return match ? match[1] : '';
  },

  _utcOffsetByLang: function(lang) {
    return utcOffsetsByLang[lang] || 0;
  },

  _isUserTimezoneDetected: function() {
    return !!this._userTimezone();
  },

  _getDate: function(dateISO) {
    if (dateISO) {
      return new Date(dateISO);
    }
    return new Date();
  },

  _getMomentTimezoneAbbr: function(timezoneName, dateISO) {
    return moment(this._getDate(dateISO)).tz(timezoneName).format('z');
  },

  _getCurrentUser: function() {
    if (!currentUser && !this.isServerRuntime()) {
      currentUser = require('../runtime/current-user');
    }
    return currentUser;
  },

  isServerRuntime: function() {
    return typeof window === 'undefined';
  }

};
