/**
 * @fileOverview Module for converting measurement units
 * Make float format by default
 */
'use strict';

// constants
const INCH_IN_FOOT = 12;
const INCH_IN_MM = 25.4;
const POUND_IN_GRAMS = 453.6;
const GRAMS_IN_KG = 1000;

module.exports = {

  inch2mm: function(value) {
    return formatFloat(value * INCH_IN_MM);
  },

  inch2foot: function(value) {
    return formatFloat(value / INCH_IN_FOOT);
  },

  foot2inch: function(value) {
    return value * INCH_IN_FOOT;
  },

  footAndInch2mm: function(foot, inch) {
    foot = +foot || 0;
    inch = +inch || 0;
    inch = this.foot2inch(foot) + inch;
    return this.inch2mm(inch);
  },

  mm2footAndInch: function(value) {
    return this.inch2footAndInch(Math.round(this.mm2inch(value)));
  },

  inch2footAndInch: function(value) {
    return {
      inch: value % INCH_IN_FOOT,
      foot: Math.floor(value / INCH_IN_FOOT)
    };
  },

  mm2foot: function(value) {
    return this.inch2foot(this.mm2inch(value));
  },

  mm2inch: function(value) {
    return formatFloat(value / INCH_IN_MM);
  },

  lbs2g: function(value) {
    return formatFloat(value * POUND_IN_GRAMS);
  },

  g2lbs: function(value) {
    return formatFloat(value / POUND_IN_GRAMS);
  },

  kg2g: function(value) {
    return formatFloat(value * GRAMS_IN_KG);
  },

  g2kg: function(value) {
    return formatFloat(value / GRAMS_IN_KG);
  },

  usd2cents: function(value) {
    value = (+value).toFixed(2);
    return Math.round(value * 100);
  },

  cents2usd: function(value) {
    return value / 100;
  },

  /**
   * Convert time from UNIX format to milliseconds
   */
  unix2ms: function(value) {
    return value * 1000;
  },

  ms2unix: function(value) {
    return Math.round(value / 1000);
  }

};

/** Format floats accoriding precison
 * Default precision is 2 signs after point
 */
function formatFloat(value, precision) {
  const power = Math.pow(10, precision || 2);
  return Math.round(value * power) / power;
}
