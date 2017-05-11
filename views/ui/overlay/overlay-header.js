'use strict';

const View = require('views/view');
const DropDownView = require('../dropdown');

const template = require('ui/overlay/templates/overlay-header.nunj');

module.exports = View.extend({

  template: template,

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    if (this.options.hasDropDown) {
      this.dropDownView = new DropDownView();
    }
    this.initModelListeners();
  },

  initModelListeners: function() {
    if (this.model) {
      this.listenTo(this.model, 'change:actions', this.render);
      this.listenTo(this.model, 'change:title', this.render);
    }
  },

  render: function() {
    this.renderTemplate({
      mods: this.options.mods
    });
    this._renderDropDown();

    return this.renderDone();
  },

  _renderDropDown: function() {
    if (this.dropDownView) {
      this.setElementToSubView(this.dropDownView);
    }
  }

});
