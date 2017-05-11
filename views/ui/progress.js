/*
 *  Progress bar view
 *  re-renders on model 'change:progress' event
 */
'use strict';

const View = require('views/view');
const template = require('ui/progress/progress.nunj');

module.exports = View.extend({

  template: template,

  className: 'progress',

  initialize: function(options) {
    View.prototype.initialize.call(this, options);
    this.listenTo(this.model, 'change:progress', this.updateProgress);
    this.listenTo(this.model, 'change:processing', this.updateProgress);
  },

  render: function() {
    this.renderTemplate();
    this.updateProgress();
    return this;
  },

  updateProgress: function() {
    let progress = this.model.get('progress') || 0;
    const processing = this.model.get('processing') || 0;
    let message = progress + '%';

    if (processing) {
      message = 'Processing';
      progress = 100;
      this.$('.js-progress-bar').addClass('is-processing');
    }

    this.$('.js-progress-text').text(message);
    this.$('.js-progress-bar').css('width', progress + '%');
    return this;
  }

});
