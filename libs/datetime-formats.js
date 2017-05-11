'use strict';

const _ = require('underscore');
const getState = require('../../../app/utils/state');

const translations = {
  _defaults: {
    serverFormat: 'YYYY-MM-DD',
    serverFullFormat: 'YYYY-MM-DD h:mm A',
    datetimeTimestamp: 'x',

    datetimeDatePickerSeparator: ' / ',
    datetimeDateMask: 'd9 / m9 / y999',

    // formats
    datetimeFormatDefault: 'YYYY-MM-DD',
    datetimeFormatPickerParts: ['DD', 'MM', 'YYYY'],
    datetimeFormatPicker: 'dd:S:mm:S:yyyy',
    datetimeFormatPickerTime: 'h:mm A',
    datetimeFormatPickerFull: 'dd:S:mm:S:yyyy h:mm A',
    datetimeFormatPickerUpper: 'DD:S:MM:S:YYYY',
    datetimeEntryFormatPicker: 'D:S:O:S:Y',
    datetimeFormatPickerFullUpper: 'DD:S:MM:S:YYYY h:mm A',
    datetimeFormatDisplay: 'DD MMM, YYYY',
    datetimeFormatDisplayWithoutYear: 'DD MMM',
    datetimeFormatDisplayFull: 'DD MMM, YYYY h:mm A',
    datetimeFormatDisplayFullWithoutYear: 'DD MMM, h:mm a',
    datetimeFormatCalendar: 'DD MMMʼYY',
    datetimeFormatCalendarEntry: 'ddd. MMM DD',
    datetimeFormatCalendarEntryBold: 'ddd. MMM <b>DD</b>, YYYY',
    datetimeFormatCalendarEntryFull: 'ddd. MMM DD, YYYY',
    datetimeFormatTime: 'h:mm a',
    datetimeFormatTimeA: 'h:mm A',
    datetimeFormatTimeAA: 'h:mm a'
  },
  'en-us': function() {
    return _.extend({}, this._defaults, {
      datetimeDatePickerSeparator: ' / ',
      datetimeDateMask: 'm9 / d9 / y999',

      // formats
      datetimeFormatDefault: 'MM-DD-YYYY',
      datetimeFormatPickerParts: ['MM', 'DD', 'YYYY'],
      datetimeFormatPicker: 'mm:S:dd:S:yyyy',
      datetimeFormatPickerTime: 'h:mm A',
      datetimeFormatPickerFull: 'mm:S:dd:S:yyyy h:mm A',
      datetimeFormatPickerUpper: 'MM:S:DD:S:YYYY',
      datetimeEntryFormatPicker: 'O:S:D:S:Y',
      datetimeFormatPickerFullUpper: 'MM:S:DD:S:YYYY h:mm A',
      datetimeFormatDisplay: 'MMM DD, YYYY',
      datetimeFormatDisplayWithoutYear: 'MMM DD',
      datetimeFormatDisplayFull: 'MMM DD, YYYY h:mm A',
      datetimeFormatDisplayFullWithoutYear: 'MMM DD, h:mm a',
      datetimeFormatCalendar: 'MMM DDʼYY',
      datetimeFormatTime: 'h:mm a',
      datetimeFormatTimeA: 'h:mm A',
      datetimeFormatTimeAA: 'h:mm a'
    });
  },
  en: function() {
    return _.extend({}, this._defaults);
  },
  'en-gb': function() {
    return _.extend({}, this._defaults);
  },
  ng: function() {
    return _.extend({}, this._defaults);
  }
};

const formatTemplates = {};
_.each(['en', 'en-gb', 'en-us', 'ng'], function(lang) {
  formatTemplates[lang] = translations[lang]();
});

const Formats = {
  SERVER: 'server',
  SERVER_FULL: 'server-full',
  PICKER: 'picker',
  PICKER_FULL: 'picker-full',
  DISPLAY: 'display',
  DISPLAY_WITHOUT_YEAR: 'display-without-year',
  DISPLAY_FULL: 'display-full',
  DISPLAY_FULL_WITHOUT_YEAR: 'display-full-without-year',
  CALENDAR: 'calendar',
  CALENDAR_ENTRY: 'calendar-entry',
  CALENDAR_ENTRY_BOLD: 'calendar-entry-bold',
  CALENDAR_ENTRY_FULL: 'calendar-entry-full',
  TIME: 'time',
  TIME_A: 'time-A',
  TIME_AA: 'time-a',
  TIMESTAMP: 'timestamp'
};

module.exports = {

  getServerFormat: function() {
    return this.translate('serverFormat');
  },

  getServerFullFormat: function() {
    return this.translate('serverFullFormat');
  },

  getDatePickerFormatParts: function() {
    return this.translate('datetimeFormatPickerParts');
  },

  getDatePickerSeparatorFormat: function() {
    return this.translate('datetimeDatePickerSeparator');
  },

  getDatePickerFormat: function(options) {
    options = options || {};
    let format = this.translate('datetimeFormatPicker');
    if (!options.isPicker) format = this.translate('datetimeFormatPickerUpper');
    return format.replace(/:S:/g, this.getDatePickerSeparatorFormat());
  },

  getDatePickerFullFormat: function() {
    return this.getDatePickerFormat() + ' ' + this.translate('datetimeFormatPickerTime');
  },

  getFormatTemplate: function(format) {
    if (!format) return this.translate('datetimeFormatDefault');
    format = this.parseFormat(format);
    switch (format) {
      case Formats.SERVER:
        return this.getServerFormat();
      case Formats.SERVER_FULL:
        return this.getServerFullFormat();
      case Formats.PICKER:
        return this.getDatePickerFormat();
      case Formats.PICKER_FULL:
        return this.getDatePickerFullFormat();
      case Formats.DISPLAY:
        return this.translate('datetimeFormatDisplay');
      case Formats.DISPLAY_WITHOUT_YEAR:
        return this.translate('datetimeFormatDisplayWithoutYear');
      case Formats.DISPLAY_FULL:
        return this.translate('datetimeFormatDisplayFull');
      case Formats.DISPLAY_FULL_WITHOUT_YEAR:
        return this.translate('datetimeFormatDisplayFullWithoutYear');
      case Formats.CALENDAR:
        return this.translate('datetimeFormatCalendar');
      case Formats.CALENDAR_ENTRY:
        return this.translate('datetimeFormatCalendarEntry');
      case Formats.CALENDAR_ENTRY_FULL:
        return this.translate('datetimeFormatCalendarEntryFull');
      case Formats.CALENDAR_ENTRY_BOLD:
        return this.translate('datetimeFormatCalendarEntryBold');
      case Formats.TIME:
        return this.translate('datetimeFormatTime');
      case Formats.TIME_A:
        return this.translate('datetimeFormatTimeA');
      case Formats.TIME_AA:
        return this.translate('datetimeFormatTimeAA');
      case Formats.TIMESTAMP:
        return this.translate('datetimeTimestamp');
    }
    return format;
  },

  parseFormat: function(format) {
    return format.replace(/-tz$/, '');
  },

  getLang: function() {
    return getState().lang;
  },

  translate: function(token) {
    const lang = this.getLang();
    if (!formatTemplates[lang]) {
      throw Error('Lang "' + lang + '" is not supported.');
    }
    const result = formatTemplates[lang][token];

    if (!result) console.log('There is no datetime template for provided format: "' + token +
      '"');

    return result;
  },

  isTimestamp: function(format) {
    return Formats.TIMESTAMP === format;
  },

  needToShowTimezone: function(format) {
    format = format + '';
    return format !== this.parseFormat(format);
  }
};

module.exports.Formats = Formats;
