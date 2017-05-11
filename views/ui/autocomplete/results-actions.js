'use strict';

const View = require('views/view');

const template = require('ui/autocomplete-directory/templates/results-actions.nunj');

module.exports = View.extend({

  template: template,

  isMore: false,

  events: {
    'click .js-load-more': 'onLoadMoreClick',
    'click .js-close': 'onCloseClick'
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.initModelListeners();
  },

  initModelListeners: function() {
    this.listenTo(this.model, 'search-more search-more:done', this.toggleMoreLoading);
    this.listenTo(this.model, 'request sync error', this.toggleMoreButton);
  },

  render: function() {
    this.renderTemplate({
      isMore: this.isMore
    });
    this.toggleBlocks();
    return this.renderDone();
  },

  toggleBlocks: function() {
    this.toggleMoreLoading();
    this.toggleMoreButton();
    return this;
  },

  toggleMoreButton: function() {
    if (!this.isMore) return this;

    const hasMore = this.model.hasMore();

    this.$('.js-load-more').toggleClass('is-hidden', !hasMore);
    return this;
  },

  toggleMoreLoading: function() {
    if (!this.isMore) return this;

    const isLoading = this.model.isMoreLoading();

    this.$('.js-load-more-preloader').toggleClass('is-loading', isLoading);
    return this;
  },

  onLoadMoreClick: function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.model.loadMore();
    return this;
  },

  onCloseClick: function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.trigger('close');
    return this;
  }

});
