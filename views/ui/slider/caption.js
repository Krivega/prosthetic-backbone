'use strict';

const View = require('views/view');
const template = require('elements/slider/templates/caption.nunj');

module.exports = View.extend({

  template: template,

  className: 'captions__caption',

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.listenTo(this.model, 'change:caption', this.onModelChange);
  },

  render: function() {
    this.renderTemplate();
    return this.renderDone();
  },

  toggle: function(isHide) {
    this.$el.toggleClass('swiper-slide-visible', isHide);
    return this;
  },

  onModelChange: function() {
    this.trigger('change:model', this);
  }

});
