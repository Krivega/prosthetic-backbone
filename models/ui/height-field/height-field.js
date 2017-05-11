'use strict';

const Model = require('models/model');
const convert = require('libs/convert-utils');
const utils = require('utils');

const dimentions = {
  INCH: 1,
  CM: 2
};

module.exports = Model.extend({

  defaults: {
    label: 'height',
    fieldName: 'height',
    // base value in mm
    value: 0
  },

  lockedAttrs: {
    label: true,
    fieldName: true
  },

  parse: function(data = {}) {
    if (data.value) {
      data.value = +data.value;
    }
    return data;
  },

  getTemplateData: function() {
    return {
      fieldName: this.get('fieldName'),
      label: this.get('label'),
      detached: this.get('detached'),
      heightFootValue: this.getFeetValue(),
      heightInchValue: this.getInchValue(),
      heightMetricValue: this.getMetricValue(),
      heightDimention: this.getDimention()
    };
  },

  getValue: function() {
    return this.get('value');
  },

  getDimention: function() {
    return this.get('dimention') || (lang === 'en-us' ? dimentions.INCH : dimentions.CM);
  },

  getMetricValue: function() {
    return Math.round(this.getValue() / 10);
  },

  getFeetValue: function() {
    return convert.mm2footAndInch(this.getValue()).foot;
  },

  getInchValue: function() {
    return convert.mm2footAndInch(this.getValue()).inch;
  },

  setFootAndInchData: function(feetValue, inchValue) {
    this.set({
      value: convert.footAndInch2mm(+feetValue, +inchValue)
    });
  },

  setMetricData: function(metricValue) {
    this.set({
      value: parseInt(utils.getFloatNumber(+metricValue) * 10)
    });
  },

  setDimention: function(value) {
    this.set('dimention', +value);
  },

  isMetric: function() {
    return this.getDimention() === dimentions.CM;
  }

});
