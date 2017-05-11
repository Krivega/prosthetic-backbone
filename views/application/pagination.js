'use strict';

const View = require('../view');
const template = require('elements/pagination/templates/pagination.nunj');

module.exports = View.extend({

  template: template,

  events: {
    'click .js-prev': 'onPrevClick',
    'click .js-next': 'onNextClick',
    'click .js-page': 'onPageClick'
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.initCollectionListeners();
    this.listenTo(this.model, 'change:page totalChanged', this.render);
  },

  initCollectionListeners: function() {
    if (this.collection) {
      this.listenTo(this.collection, 'request', this.onCollectionRequest);
      this.listenTo(this.collection, 'sync error', this.onCollectionSync);
    }
  },

  render: function() {
    this.renderTemplate();
    this.toggleBlocks();
    return this.renderDone();
  },

  toggleBlocks: function() {
    this.toggle(!this.model.hasPagination());
    this.$('.js-page').toggleClass('is-hidden', !this.model.hasPages());
  },

  onPrevClick: function() {
    if (this.model.hasPrev() === false) return false;
    this.model.prevPage();
    this.trigger('page:change');
    return false;
  },

  onNextClick: function() {
    if (this.model.hasNext() === false) return false;
    this.$('.js-next').prop('disabled', true);
    this.model.nextPage();
    this.trigger('page:change');
    return false;
  },

  onPageClick: function(e) {
    const page = this.$(e.currentTarget).data('page');
    this.model.toPage(page);
    this.trigger('page:change');
    return false;
  },

  onCollectionRequest: function() {
    this.toggle(true);
  },

  onCollectionSync: function() {
    this.toggleBlocks();
  }

});
