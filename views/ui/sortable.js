/**
 * @fileOverview Wrapper for sortable library
 * {@link https://github.com/RubaXa/Sortable}
 */
'use strict';

const _ = require('underscore');
const View = require('views/view');
const Sortable = require('sortablejs');

module.exports = View.extend({

  instance: null,

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);

    _.bindAll(this, 'onUpdate');

    // default settings
    const sortableDefaults = {
      onUpdate: this.onUpdate,
      ghostClass: 'sortable--ghost'
    };
    this.options.sortable = _.extend(sortableDefaults, this.options.sortable);
    this.listenTo(this.collection, 'add remove reset', this.onCollectionUpdate);
  },

  render: function() {
    this.instance = new Sortable(this.el, this.options.sortable);
  },

  toggleDisabled: function(disable) {
    this.instance.option('disabled', disable);
  },

  disable: function() {
    this.toggleDisabled(true);
  },

  enable: function() {
    this.toggleDisabled(false);
  },

  remove: function() {
    // redefine to keep this.el of parent view undamaged
    this.stopListening();
    return this;
  },

  onUpdate: function(evt) {
    const model = this.collection.at(evt.oldIndex);
    this.collection.remove(model, {silent: true});
    this.collection.add(model, {silent: true, at: evt.newIndex});
    this.trigger('sortable:update');
  },

  onCollectionUpdate: function() {
    this.toggleDisabled(this.collection.length < 2);
  }

});
