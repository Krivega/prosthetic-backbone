'use strict';

const View = require('views/view');
const template = require('views/ui/errors/errors.nunj');

module.exports = View.extend({

  template,

  initialize() {
    View.prototype.initialize.apply(this, arguments);
    this.listenTo(this.model, 'change:errors', this.render);
  },

  render() {
    this.renderTemplate();
    this.toggle();
    this.renderDone();
  },

  toggle(force) {
    const show = force === undefined ? this.model.hasErrors() : force;
    this.$('.js-errors').toggleClass('is-hidden', !show);
  }

});
