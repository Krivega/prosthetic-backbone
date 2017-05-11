'use strict';

const View = require('views/view');

module.exports = View.extend({

  events: {
    'click .js-more-block-show': 'show',
    'click .js-more-block-hide': 'hide'
  },

  show: function() {
    this.$('.js-more-block').addClass('is-active');
  },

  hide: function() {
    this.$('.js-more-block').removeClass('is-active');
  },

  toggle: function(hide) {
    if (hide) {
      this.hide();
    } else {
      this.show();
    }
  }

});
