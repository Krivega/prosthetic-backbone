'use strict';

var View = require('views/view');

module.exports = View.extend({

  className: 'overlay-backdrop',

  events: {
    click: 'onClick'
  },

  render: function() {
    this.$el.hide();
    return this;
  },

  show: function(callback) {
    this.$el.fadeIn(callback);
    return this;
  },

  hide: function(callback) {
    this.$el.fadeOut(callback);
    return this;
  },

  setIndex: function(index) {
    this.$el.css({
      'z-index': index
    });
    return this;
  },

  onClick: function() {
    this.trigger('click');
    return this;
  }

});
