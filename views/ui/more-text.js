'use strict';

const View = require('views/view');

module.exports = View.extend({

  events: {
    'click .js-more-text-show': 'show'
  },

  show: function() {
    this.$('.js-more-text-show-block').addClass('is-hidden');
    this.$('.js-more-text').addClass('is-hidden');
    this.$('.js-more-text-full').removeClass('is-hidden');
  }

});
