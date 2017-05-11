'use strict';

const View = require('views/view');
const utils = require('utils');

const DateTimeFormatter = View.extend({

  initialize: function() {
    this.$('[data-dt-time]').each((index, item)=> {
      const $el = this.$(item);
      $el.text(utils.formatDate($el.data('dt-time'), $el.data('dt-format')));
      //$(this).removeAttr('data-dt-time').removeAttr('data-dt-format');
    });
    this.$('[data-dt-tz]').each((index, item) =>{
      this.$(item).text(utils.getTzAbr());
      //$(this).removeAttr('data-dt-tz').removeAttr('data-dt-format');
    });
  }

});

module.exports = new DateTimeFormatter({
  el: $document
});
