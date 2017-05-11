'use strict';

var ListView = require('views/application/list');
var ActionView = require('./button');

module.exports = ListView.extend({

  className: 'grid',

  itemView: ActionView,

  initialize: function() {
    ListView.prototype.initialize.apply(this, arguments);

    this.listenTo(this.collection, 'reset', this.render);
  },

  itemFilter: function(model) {
    return !model.get('disabled');
  },

  render: function() {
    ListView.prototype.render.apply(this, arguments);
  }

});
