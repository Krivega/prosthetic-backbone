'use strict';

const Collection = require('models/collection');
const ItemModel = require('./movable-item');
const MAX_SIZE = 5;

module.exports = Collection.extend({

  model: ItemModel,

  parse: function(data) {
    if (!data) data = [];
    if (this.isMaxSizeNotExceeded(data.length)) {
      data.push({});
    }
    return data;
  },

  toJSON: function() {
    const data = Collection.prototype.toJSON.apply(this, arguments);

    if (this.filterEmptyJSONItems) {
      return this.filterEmptyJSONItems(data);
    }
    return data;
  },

  createItem: function() {
    const size = this.size();
    if (this.isMaxSizeNotExceeded(size)) {
      return this.add({});
    }
    return this;
  },

  isMaxSizeNotExceeded: function(size) {
    return size < this.getMaxSize();
  },

  getMaxSize: function() {
    return this.options.maxSize || MAX_SIZE;
  }

});
