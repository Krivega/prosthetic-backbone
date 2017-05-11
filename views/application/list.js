/*
 *  Base List view that renders collection
 */
'use strict';

const _ = require('underscore');
const View = require('views/view');
const utils = require('utils');

module.exports = View.extend({

  listSelector: null,
  $list: null,
  itemView: View,
  itemViews: null,
  isEmptyList: false,
  itemOptions: null,

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    if (this.options.listSelector !== undefined) this.listSelector = this.options.listSelector;
    if (!this.$list) this.$list = this.$el;
    this.itemOptions = _.extend({}, this.options, this.options.itemOptions);
    this.itemViews = [];
    this.listenTo(this.collection, {
      add: this.onItemAdd,
      reset: this.onReset,
      remove: this.onItemRemove
    });
  },

  render: function() {
    const listSelector = _.result(this, 'listSelector');
    this.$list = listSelector ? this.$(listSelector) : this.$el;
    if (this.isEmptyList) this.$list.empty();

    this.renderList();
    return this.renderDone();
  },

  renderList: function() {
    this.collection.each(this.renderItem, this);
    return this;
  },

  removeItemViews: function() {
    const _ref = _.clone(this.itemViews);
    _.each(_ref, function(item) {
      this.itemRemoved(item.model);
    }, this);
    return this;
  },

  // Creates and renders item view
  renderItem: function(model, collectionOrIndex) {
    if (!this.itemFilter(model)) return;

    const name = this._getSubviewName(model);
    let view = this.subview(name);
    let index;

    if (!view) {
      view = new this.itemView(_.extend({}, this.itemOptions, {
        model: model
      }));

      this.listenTo(view, 'all', this.trigger);
      this.subview(name, view);
      this.itemViews.push(view);
    } else {
      view.delegateEvents();
    }

    if (_.isObject(collectionOrIndex) && _.isFunction(collectionOrIndex.indexOf)) {
      // allow to insert subview at defined position
      index = collectionOrIndex.indexOf(model);
    } else {
      index = collectionOrIndex;
    }

    this.insertView(this.$list, view, index);

    if (view) view.render();

    return view;
  },

  findSubviewByModel: function(model) {
    const name = this._getSubviewName(model);
    return this.subviewsByName[name];
  },

  itemRemoved: function(item) {
    const name = this._getSubviewName(item);
    const view = this.subviewsByName[name];
    const index = utils.indexOf(this.itemViews, view);
    if (index !== -1) {
      this.itemViews.splice(index, 1);
    }
    this.removeSubview(name);
    return index;
  },

  itemFilter: function(model) {
    return !model.isNotRendered();
  },

  getItemViews: function() {
    return this.itemViews;
  },

  getFirstItemView: function() {
    const items = this.getItemViews();
    return items.length ? items[0] : undefined;
  },

  getLastItemView: function() {
    const itemViews = this.getItemViews();
    const length = itemViews.length;
    return length === 0 ? undefined : itemViews[length - 1];
  },

  isLastItemView: function(view) {
    const lastView = this.getLastItemView();
    return lastView === view;
  },

  onReset: function() {
    this.removeItemViews();
    this.render();
  },

  onItemAdd: function(model) {
    return this.renderItem(model, this.collection);
  },

  onItemRemove: function(model) {
    return this.itemRemoved(model);
  }

});
