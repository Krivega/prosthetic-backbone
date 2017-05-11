'use strict';

const View = require('views/view');
const $ = require('jquery');
const vent = require('runtime/vent');
const PanelActionsView = require('views/ui/panel-actions');

module.exports = View.extend({

  events: {
    'click .js-maximize': 'onClickMaximize',
    'click .js-minimize': 'onClickMinimize'
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.panelActionsView = new PanelActionsView();
  },

  render: function() {
    this.setElementToSubView('.js-panel-actions', this.panelActionsView);
    this.renderDone();
  },

  togglePage: function() {
    this.$('.js-maximize').toggleClass('is-hidden');
    this.$('.js-minimize').toggleClass('is-hidden');
    $('.js-page').toggleClass('is-maximize');
    vent.trigger('maximize-page');
    this.panelActionsView.resetFloats();
  },

  onClickMaximize: function() {
    this.togglePage();
  },

  onClickMinimize: function() {
    this.togglePage();
  }

});
