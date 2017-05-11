'use strict';

var Model = require('models/model');

module.exports = Model.extend({

  defaults: {
    confirmationTitle: 'Confirm your action',
    confirmationDescription: 'Are you sure?'
  },

  confirm: function() {
    this.trigger('confirm');
  }

});
