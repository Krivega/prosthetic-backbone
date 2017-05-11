'use strict';

const _ = require('underscore');
const ValidationForm = require('views/application/validation-form');

module.exports = ValidationForm.extend({

  events: _.extend({
    'click .js-up': 'onUp',
    'click .js-down': 'onDown',
    'click .js-remove': 'onRemove'
  }, ValidationForm.prototype.events),

  defaultOptions: {
    itemLabelPrefix: '',
    showLabelHash: true
  },

  attributes: function() {
    const attrs = {};
    attrs.style = 'order:' + this.model.getCollectionIndex(); // TODO: use a specific class
    return attrs;
  },

  initialize: function() {
    ValidationForm.prototype.initialize.apply(this, arguments);

    this.listenTo(this.model.collection, 'add remove', this.onModelsUpdate);
    this.listenTo(this.model.collection, 'move', this.onModelsMove);
  },

  render: function() {
    this.toggleBlocks();
    return this.renderDone();
  },

  toggleBlocks: function() {
    this.$('.js-up').prop('disabled', !this.model.isMovableUp());
    this.$('.js-down').prop('disabled', !this.model.isMovableDown());
    this.$('.js-remove').prop('disabled', !this.model.isRemovable());
  },

  handleLastModified: function(value) {
    if (this.model.isLast() && value) {
      this.trigger('add-item');
    }
  },

  updateItemOrder: function() {
    this.$el.css('order', this.model.getCollectionIndex());
    this.$('.js-desk').html(this.getDesktopLabel());
    this.$('.js-mob').html(this.getMobileLabel());
    this.toggleBlocks();
  },

  getDesktopLabel: function() {
    if (!this.isNeedToShowHash()) {
      return this.model.getCollectionIndex() + 1;
    }
    return `${this.getLabelPrefix()} #${this.model.getCollectionIndex() + 1}`.trim();
  },

  getMobileLabel: function() {
    if (!this.isNeedToShowHash()) {
      return this.model.getCollectionIndex() + 1;
    }
    return `#${this.model.getCollectionIndex() + 1}`;
  },

  getLabelPrefix: function() {
    return this.options.itemLabelPrefix || '';
  },

  isNeedToShowHash: function() {
    return this.options.showLabelHash;
  },

  onModelsUpdate: function() {
    this.toggleBlocks();
  },

  onModelsMove: function() {
    this.updateItemOrder();
  },

  onUp: function() {
    this.model.moveUp();
  },

  onDown: function() {
    this.model.moveDown();
  },

  onRemove: function() {
    this.model.remove();
  }

});
