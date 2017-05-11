'use strict';

const _ = require('underscore');
const View = require('views/view');
const Model = require('models/model');

const template = require('ui/components/icon.nunj');

module.exports = View.extend({

  template: template,
  properties: [
    'name', 'mods', 'title'
  ],

  initialize: function(options) {
    View.prototype.initialize.apply(this, arguments);
    this.model = new Model(_.pick(options, this.properties));
    this.listenTo(this.model, 'change', this.render);
  },

  render: function() {
    this.renderTemplate();
    return this.renderDone();
  },

  updateIcon: function(data) {
    this.model.set(_.pick(data, this.properties));
  }

});
