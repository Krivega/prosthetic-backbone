'use strict';

const View = require('views/view');
const template = require('ui/actions/action.nunj');

module.exports = View.extend({

  template,

  className: 'list-actions__item',
  modsClass: 'upper',

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
    if (this.model.isCustom && this.model.isCustom()) {
      e.preventDefault();
      e.stopPropagation();
      this.model.customAction();
    }
  }

});
