'use strict';

var _ = require('underscore');
var Collection = require('../collection');
var FormDefinition = require('./form-constructor-definition');

module.exports = Collection.extend({

  model: FormDefinition,

  getValidatedAttrs: function() {
    var validatedAttrs = {};
    this.each(function(model) {
      _.extend(validatedAttrs, model.getValidatedRules());
    }, this);
    return validatedAttrs;
  },

  hasField: function(name) {
    return !!this.getField(name);
  },

  hasType: function(type) {
    return !!this.getFieldByType(type);
  },

  getFields: function() {
    var fields = [];
    this.each(function(model) {
      fields.push(model.getField());
    }, this);
    return fields;
  },

  getFieldsByType: function(type) {
    return this.where({
      type: type
    });
  },

  getFieldByType: function(type) {
    return this.findWhere({
      type: type
    });
  },

  getField: function(name) {
    return this.findWhere({
      name: name
    });
  }

});
