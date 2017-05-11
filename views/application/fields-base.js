'use strict';

const View = require('views/view');

/**
 * abstract class for 'fields-generator' childViews
 */

module.exports = View.extend({

  isValid: function() {
    return false;
  },

  val: function() {
    return undefined;
  }
});
