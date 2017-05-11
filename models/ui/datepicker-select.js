'use strict';

const Model = require('models/model');
module.exports = Model.extend({

  defaults: {
    startYear: 1905,
    endYear: 0
  },

  getTemplateData: function() {
    const data = {};
    data.data = this.getData();
    data.days = this._getDays();
    data.months = this._getMonths();
    data.years = this._getYears();
    return data;
  },

  /**
   * set data object
   * @param  {object} data = day, month, year
   */
  setData: function(data = {}) {
    this.set(data);
  },

  getData: function() {
    const data = {};
    const day = this.get('day');
    const month = this.get('month');
    const year = this.get('year');
    if (day !== '' && day !== undefined) data.day = day;
    if (month !== '' && month !== undefined) data.month = month;
    if (year !== '' && year !== undefined) data.year = year;
    return data;
  },

  _getDays: function() {
    let day = 1;
    const days = [];
    const month = this.get('month');
    const year = this.get('year');
    const daysLength = this._daysInMonth(month, year);
    while (day <= daysLength) {
      days.push({
        name: day,
        value: day
      });
      day++;
    }

    return days;
  },

  _daysInMonth: function(month, year) {
    month = month || 12;
    year = year || new Date().getFullYear();
    return (new Date(year, month, 0)).getDate();
  },

  _getMonths: function() {
    let month = 1;
    const years = [];

    while (month <= 12) {
      years.push({
        token: 'monthNameShort' + month,
        value: month
      });
      month++;
    }

    return years;
  },

  _getYears: function() {
    let startYear = this._getYearFromSettings('startYear');
    const endYear = this._getYearFromSettings('endYear');
    const years = [];

    while (startYear <= endYear) {
      years.push({
        name: startYear,
        value: startYear
      });
      startYear++;
    }

    return years.reverse();
  },

  _getYearFromSettings: function(year) {
    year = this.get(year);
    if (year.toString().length !== 4) {
      year = (new Date()).getFullYear() + year;
    }

    return year;
  }

});
