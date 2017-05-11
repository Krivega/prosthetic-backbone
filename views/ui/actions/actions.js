'use strict';

var ListView = require('views/application/list');
var ActionView = require('./action');
var template = require('ui/actions/actions.nunj');

module.exports = ListView.extend({

  template: template,

  listSelector: '.js-list',

  itemView: ActionView,

  initialize: function() {
    ListView.prototype.initialize.apply(this, arguments);

    this.listenTo(this.collection, 'reset', this.render);
  },

  itemFilter: function(model) {
    return !model.get('disabled');
  },

  render: function() {
    this.renderTemplate(this.options);
    ListView.prototype.render.apply(this, arguments);
  }

});
