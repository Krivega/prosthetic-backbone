'use strict';

const _ = require('underscore');
const View = require('views/view');
const template = require('ui/filters/filters-list-more.nunj');
const PreloaderView = require('views/application/preloader');

module.exports = View.extend({

  template: template,
  loading: false,
  scrollable: true,
  scrollListerAdded: false,

  events: {
    'click .js-more': 'onMoreClick'
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);

    this.preloaderView = new PreloaderView();

    this.filteredList = this.options.filteredList;
    this.scrollable = this.options.scrollable !== false;

    this.listenTo(this.collection, 'request:remove', this.onCollectionRequest);
    this.listenTo(this.collection, 'sync error', this.onCollectionSync);
    this.listenTo(this.collection, 'add remove', this.renderList);
  },

  render: function() {
    this.renderTemplate();
    this.preloaderView.setElement(this.$el).hidePreloader();
    this.subRender('.js-filtered-list', this.filteredList);
    this.toggleMore();
    this.initScrollable();
    return this;
  },

  renderList: function() {
    this.filteredList.render();
  },

  initScrollable: function() {
    if (this.scrollable && !this.scrollListerAdded) {
      $window.on('scroll.filtered-list-more' + this.cid, _.bind(this.onScroll, this));
      this.scrollListerAdded = true;
    }
  },

  loadMore: function() {
    if (this.canLoadMore()) {
      this.startMoreLoading();
      this.collection.loadMore();
    }
    return this;
  },

  canLoadMore: function() {
    return !this.isLoading() && this.collection.hasMore();
  },

  toggleMore: function() {
    this.stopMoreLoading();
    this.$('.js-more').toggleClass('is-hidden', !this.collection.hasMore());
    this.$('.js-more-block').toggleClass('is-hidden', !this.collection.hasMore());
  },

  startMoreLoading: function() {
    this.loading = true;
    this.$('.js-more').addClass('is-loading');
  },

  stopMoreLoading: function() {
    this.loading = false;
    this.$('.js-more').removeClass('is-loading');
  },

  isLoading: function() {
    return this.loading;
  },

  onCollectionRequest: function() {
    this.stopMoreLoading();
    this.preloaderView.showPreloader();
  },

  onCollectionSync: function() {
    this.toggleMore();
    this.preloaderView.hidePreloader();
  },

  onScroll: function() {
    if (!this.scrollable) return this;
    if (!this.$('.js-more').is(':visible')) return this;
    const offsetTop = this.$('.js-more').offset().top;
    if ((offsetTop - $window.height() <= $window.scrollTop()) && this.canLoadMore()) {
      this.loadMore();
    }
    return this;
  },

  onMoreClick: function() {
    this.loadMore();
  }

});
