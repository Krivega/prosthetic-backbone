'use strict';

const _ = require('underscore');
const View = require('views/view');
const ChildViewBase = require('./fields-base');

/**
 * Generate fields from array of models and DOM selector.
 * Usefull in generic forms (e.g. 'form-constructor' or 'validate-form')
 * with fields this custom logic and inner several inputs
 * like phoneField, datePickers or datePickersSelect
 *
 * Override abstract methods for your logic
 */

module.exports = View.extend({

  /**
   * @abstract
   */
  ChildView: ChildViewBase,
  /**
   * @abstract
   * Common template is '.js-field-${fieldName}'
   */
  childSelectorBase: '.js-field',

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);

    this.fields = {};
    if (this.options.fieldModels && this.options.fieldModels.length) {
      this.initFields();
    }
  },

  initFields: function() {
    const fieldModels = this.options.fieldModels;
    fieldModels.forEach(this.initOneField.bind(this));
  },

  /**
   * @abstract
   * @param {Backbone.Model} fieldModel
   * @description Generate and returns options for new ChildView
   * @return {Object}
   */
  getChildOptions: function(fieldModel) {
    return fieldModel.toJSON();
  },

  /**
   * @param {Backbone.Model} fieldModel
   * @description Generate and return name for new field
   * @return {string}
   */
  getFieldName: function(fieldModel) {
    return fieldModel.get('name');
  },

  initOneField: function(fieldModel) {
    this.fields[this.getFieldName(fieldModel)] = new this.ChildView(this.getChildOptions(
      fieldModel)); //jshint ignore:line
  },

  render: function() {
    _.each(this.fields, (view, name) => {
      this.subRender(`${this.childSelectorBase}-${name}`, view);
    });
  },

  isValid: function(name) {
    if (!this.fields[name]) return false;
    return this.fields[name].isValid();
  },

  getField: function(name) {
    return this.fields[name];
  },

  val: function(name, value, options) {
    if (!this.pickers[name]) return;
    return this.fields[name].val(value, options);
  },

  fill: function(data) {
    _.each(data, (value, name) => {
      this.val(name, value, {
        format: true
      });
      if (this.fields[name]) delete data[name];
    });
  },

  showError: function(error) {
    const field = this.getField(error.name);
    if (field && field.showError) {
      field.showError(error.body);
    }
    return !!field;
  }

});
