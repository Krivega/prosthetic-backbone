'use strict';

const Item = require('views/view');
const template = require('elements/slider/templates/preview.nunj');

module.exports = Item.extend({

  template: template,

  className: 'previews__preview',

  render: function() {
    this.renderTemplate();
    this.toggleBlocks();
    return this.renderDone();
  },

  toggleBlocks: function() {
    this.$('.js-preview-caption').toggleClass('is-hidden', this.isNeedToHidePreviewCaption());
    this.$el.toggleClass('is-active', this.isAlwaysActive());
  },

  markAsUnViewed: function() {
    this.toggleIsViewed(false);
  },

  markAsViewed: function() {
    this.toggleIsViewed(true);
  },

  toggleIsViewed: function(isViewed) {
    this.$('.js-preview-is-new').toggleClass('is-hidden', isViewed);
  },

  isNeedToHidePreviewCaption: function() {
    return !!this.options.hidePreviewCaption;
  },

  isAlwaysActive: function() {
    return !!this.options.isAlwaysActive;
  },

  onModelChange: function() {
    this.trigger('change:model', this);
  }

});
