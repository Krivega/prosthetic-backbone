'use strict';
var Model = require('models/model');

module.exports = Model.extend({

  defaults: {
    isPrivate: false,
    isPublic: false
  },

  isPrivate: function() {
    return this.get('isPrivate');
  },

  isPublic: function() {
    return this.get('isPublic');
  }

});
