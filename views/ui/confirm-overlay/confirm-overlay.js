'use strict';

const _ = require('underscore');
const View = require('views/view');
const OverlayModel = require('models/model');
const OverlayView = require('views/ui/overlay');
const ConfirmView = require('./confirm');

module.exports = View.extend({

  title: _t('confirmationRequired'),
  message: _t('pleaseConfirmYourAction'),
  overlayMods: ['small'],

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);

    this.overlayModel = new OverlayModel({
      title: this.title
    });
    this.overlayView = new OverlayView({
      model: this.overlayModel,
      mods: this.overlayMods,
      withoutStack: true
    });
    this.confirmView = new ConfirmView({
      buttonNames: this.options.buttonNames
    });

    this.listenTo(this.confirmView, 'cancel', this.onCancel);
    this.listenTo(this.confirmView, 'confirm', this.onConfirm);
  },

  render: function() {
    this.subRender(this.overlayView);
    return this.renderDone();
  },

  /**
   * data is an object with fields: message, title
   * data.message - confirmation message
   * data.title - overlay title
   * @param data
   */
  show: function(data) {
    data = _.extend({
      title: this.title,
      message: this.message
    }, data);
    this.overlayModel.set('title', data.title);
    this.confirmView.setMessage(data.message);
    this.overlayView.show(this.confirmView);
  },

  close: function(options) {
    this.overlayView.close(options);
  },

  isShown: function() {
    return this.overlayView.isShown();
  },

  onCancel: function() {
    this.close();
  },

  onConfirm: function() {
    this.close();
    this.trigger('confirm');
  }

});
