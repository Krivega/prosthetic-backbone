'use strict';

const Model = require('models/model');

module.exports = Model.extend({

  getErrors: function() {
    return this.get('errors');
  },

  hasErrors: function() {
    const errors = this.getErrors();
    return !!(errors && errors.length);
  }
});
