'use strict';

const _ = require('underscore');
const utils = require('utils');
const ValidationModel = require('models/application/validation-model');

module.exports = ValidationModel.extend({

  moveUp: function() {
    this.move(-1);
  },

  moveDown: function() {
    this.move(1);
  },

  move: function(offset) {
    const size = this.collection.length;
    const collectionIndex = this.getCollectionIndex();
    const newIndex = collectionIndex + offset;
    let removedElement;

    if (newIndex > -1 && newIndex < size) {
      removedElement = this.collection.models.splice(collectionIndex, 1)[0];
      this.collection.models.splice(newIndex, 0, removedElement);
    }
    this.collection.trigger('move');
  },

  /**
   * Cannot be remove if:
   * - it is last and empty
   * - it is the only one item in the collection
   *
   * in all other cases it can be removed
   *
   * @returns {boolean}
   */
  isRemovable: function() {
    if (this.collection.length === 1) {
      return false;
    }
    if (this.isLast()) {
      return !this.isEmpty();
    }
    return true;
  },

  /**
   * Item can not be moved up if
   *  - it is first
   *  - it is a last empty item
   *
   *  in all other cases it is movable up
   *
   * @returns {boolean}
   */
  isMovableUp: function() {
    if (this.isFirst()) {
      return false;
    }
    if (this.isLast()) {
      return !this.isEmpty();
    }
    return true;
  },

  /**
   * Item can not be moved down if
   * - it is last
   * - it is penultimate (last but one) and the last item is empty.
   * in all other cases it can be moved down
   *
   * @returns {boolean}
   */
  isMovableDown: function() {
    if (this.isLast()) {
      return false;
    }
    if (this.collection.indexOf(this) === this.collection.length - 2) {
      return !this.collection.last().isEmpty();
    }
    return true;
  },

  isEmpty: function() {
    const attrs = _.clone(this.attributes);
    utils.filterEmptyProps(attrs);
    return attrs.length === 0;
  }

});
