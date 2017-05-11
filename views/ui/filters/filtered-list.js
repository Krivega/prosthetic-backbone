/**
 * @fileOverview Base class for render filtered lists
 */
'use strict';

const View = require('views/view');
const PreloaderView = require('views/application/preloader');

module.exports = View.extend({
  // specified in children classes
  template: null,

  initialize: function(options) {
    View.prototype.initialize.call(this, options);

    this.preloader = new PreloaderView();
    this.preloader.setCollection(this.collection);

    this.listenTo(this.collection, 'reset', this.render);
  },

  setElement: function() {
    View.prototype.setElement.apply(this, arguments);
    if (this.preloader) this.preloader.setElement(this.$el);
  },

  render: function() {
    this.preloader.setElement(this.$el);
    this.renderTemplate(this.collection.options);
    this.renderDone();
    return this;
  }

});
