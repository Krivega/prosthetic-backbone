'use strict';

var _ = require('underscore');
var FilteredCollection = require('backbone-filtered-collection');

_.extend(FilteredCollection.prototype, {

  getTemplateData: function() {
    return {
      length: this.length,
      items: this.map(function(model) {
        var data = _.result(model.getTemplateData);
        if (data) return data;
        return model.toJSON();
      })
    };
  }

});

module.exports = FilteredCollection;
