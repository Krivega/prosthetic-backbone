'use strict';

const _ = require('underscore');
const ListView = require('views/application/list');
const ValidationForm = require('views/application/validation-form');

// Fully transparent Adapter for {ListView}
// Work with children (subviews) which are {ValidationForm}
// Delegate all actions and flow from parent {ValidationForm} to children and back

module.exports = ListView.extend({
  subFormsCase: 'itemViews',

  serialize: function() {
    _.invoke(this.itemViews, 'serializeToModel');
  },

  validateForm: function() {
    const subResults = _.invoke(this.itemViews, 'validateForm');
    const notPassed = _.without(subResults, true);
    return notPassed.length === 0;
  },

  fill: function() {
    _.invoke(this.itemViews, 'fill');
  },

  showErrors: function() {
    return ValidationForm.prototype.showSubViewErrors.apply(this, arguments);
  }

});
