'use strict';

const View = require('views/view');
const template = require('views/errors/templates/access-denied.nunj');

module.exports = View.extend({

  template: template,

  render: function() {
    this.renderTemplate();
    return this.renderDone();
  }

});
