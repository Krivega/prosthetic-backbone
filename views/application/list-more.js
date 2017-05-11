/*
 *  Base List view with the button "more" that appends items
 *  renders collection using List view
 *  collection should implement isComplete() method
 */
'use strict';

const View = require('views/view');
const List = require('./list');
const template = require('application/list-more.jade');

module.exports = View.extend({

  events: {
    'click .js-more': 'onMoreClick'
  },

  initialize: function(options) {
    View.prototype.initialize.call(this, options);
    this.list = this.createListView(this.collection, this.options);
    this.listenTo(this.collection, 'sync', this.updateMore);
  },

  // Accepts collection and options and returns list view
  createListView: function(collection, options) { // jshint ignore:line
    return new List({
      collection: collection
    });
  },

  render: function() {
    this.$el.html(template());
    this.subRender('.js-list', this.list);
    this.updateMore();
    return this;
  },

  updateMore: function() {
    this.$('.js-more').toggleClass('is-hidden', !this.collection.hasMore());
    this.$el.toggleClass('is-hidden', this.collection.length === 0); // hide empty list
  },

  onMoreClick: function() {
    this.collection.fetch({
      withOffset: true,
      remove: false
    });
  }
});
