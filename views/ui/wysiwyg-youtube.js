'use strict';

var View = require('views/view');
var wysiwygYoutubeTemplate = require('ui/wysiwyg/templates/wysiwyg-youtube.nunj');

module.exports = View.extend({

  events: {
    'click .js-cancel': 'onCancelClick'
  },

  template: wysiwygYoutubeTemplate,

  render: function() {
    this.$el.html(wysiwygYoutubeTemplate.render());
    return this;
  },

  onCancelClick: function(e) {
    e.preventDefault();
    this.hide();
  },

  show: function() {
    this.$el.removeClass('is-hidden');
    return this;
  },

  hide: function() {
    this.$el.addClass('is-hidden');
    this.trigger('close');
    return this;
  },

  isActive: function() {
    return !this.$el.is('.is-hidden');
  }

});
