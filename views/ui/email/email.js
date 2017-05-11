'use strict';

const View = require('views/view');

const template = require('ui/email/email.nunj');

module.exports = View.extend({

  template: template,

  events: {
    'change textarea[name=body]': 'onChangeBody'
  },

  render: function() {
    this.renderTemplate();
    return this.renderDone();
  },

  onChangeBody: function(e) {
    this.model.set('body', this.$(e.currentTarget).val());
  }
});
