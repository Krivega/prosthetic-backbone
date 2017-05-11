'use strict';

const _ = require('underscore');
const Model = require('models/model');

module.exports = Model.extend({

  parse: function(data) {
    data = data || {};

    let body = data.body || '';
    const separator = data.separator || null;
    const result = {};

    if (separator) {
      body = body.split(separator);
    }

    if (_.isArray(body) && body.length > 1) {
      result.startBody = body[0];
      result.endBody = body[1];
    } else {
      result.startBody = body;
      result.endBody = '';
    }

    result.subject = data.subject || '';
    result.body = data.manualMessage || '';

    return result;
  }

});
