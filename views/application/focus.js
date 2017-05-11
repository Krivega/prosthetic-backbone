'use strict';

const View = require('views/view');

const Focus = View.extend({

  events: {
    'focusin input, select, textarea, .js-input-file-select': 'onFocusin',
    'focusout input, select, textarea, .js-input-file-select': 'onFocusout'
  },

  onFocusin: function(e) {
    const $input = this.$(e.currentTarget);
    if ($input.prop('disabled') || $input.prop('readonly')) return;

    let $field = $input.parents('.js-field:first');
    if ($field.hasClass('js-complex-field')) $field = $field.parents('.js-field:first');
    if ($field.length === 1) $field.addClass('is-focus');
  },

  onFocusout: function(e) {
    const $input = this.$(e.currentTarget);
    if ($input.prop('disabled') || $input.prop('readonly')) return;

    let $field = $input.parents('.js-field:first');
    if ($field.hasClass('js-complex-field')) $field = $field.parents('.js-field:first');

    if ($field.length === 1) {
      // timeout for processing events before changes caused by browser repaint, redraw
      // e.g. field description is hided after remove class is-focus.
      //      and we need to handle events such as click on buttons.
      if ($field.hasClass('js-has-description')) {
        setTimeout(() => {
          $field.removeClass('is-focus');
        }, 100);
      } else {
        $field.removeClass('is-focus');
      }
    }
  }

});

module.exports = new Focus({
  el: $document
});
