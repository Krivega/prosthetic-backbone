/**
 *  Box to preload and show content from CMS
 */
'use strict';

var ToggleBox = require('./toggle-box');

module.exports = ToggleBox.extend({

  initialize: function(options) {
    options.remote = true;

    ToggleBox.prototype.initialize.apply(this, arguments);

    this.listenTo(this.model, 'sync', this.onModelSync);
  },

  load: function() {
    ToggleBox.prototype.load.apply(this, arguments);
    this.model.fetch()
      .fail(this.loadAlways.bind(this));
  },

  onModelSync: function() {
    this.$('.js-toggle-box-content').html(this.model.get('body'));
    this.loadFinished();
  }

});
