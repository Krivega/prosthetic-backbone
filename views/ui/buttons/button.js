'use strict';

var View = require('views/view');
var template = require('ui/buttons/button.nunj');

module.exports = View.extend({

  template: template,

  className: 'grid__item grid__item--even',

  events: {
    click: 'onClick'
  },

  render: function() {
    this.renderTemplate(this.options);
  },

  onClick: function(e) {
    if (this.model.isConfirmationRequired()) {
      e.preventDefault();
      e.stopPropagation();
      this.trigger('confirm', this.model);
    }
    if (this.model.isOverlay()) {
      e.preventDefault();
      e.stopPropagation();
      this.trigger('overlay', this.model);
    }
  }

});
