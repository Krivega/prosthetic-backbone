'use strict';

const ValidatedListView = require('views/application/validated-list');
const ItemView = require('./movable-item');

module.exports = ValidatedListView.extend({

  itemView: ItemView,

  attributes: {
    style: 'display:flex; flex-direction: column;'
  },

  initialize: function() {
    ValidatedListView.prototype.initialize.apply(this, arguments);
    this.listenTo(this, 'add-item', this.onAddItem);
  },

  val: function(value) {
    if (value !== undefined) {
      this.collection.reset(value, {
        parse: true
      });
      return this;
    }
    return this.collection.toJSON();
  },

  onItemRemove: function() {
    ValidatedListView.prototype.onItemRemove.apply(this, arguments);
    this.onReset();
  },

  onAddItem: function() {
    this.collection.createItem();
  }

});
