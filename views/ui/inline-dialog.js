/*
 *  Inline dialog
 *  opens dialog and renders passed view inside
 */

'use strict';

var _ = require('underscore');
//var vent = require('runtime/vent');
var View = require('views/view');
var inlineDialogTemplate = require('ui/wysiwyg/templates/inline-dialog.nunj');

var cid = 0;

module.exports = View.extend({

  template: inlineDialogTemplate,

  initialize: function() {
    this.cid = cid++;
    _.bindAll(this, 'onClickOutside');
  },

  render: function(view) {
    if (this.isRendered) return this.hide();

    //vent.trigger('signin_inline:show', this);

    this.view = view;
    if (this.view) {
      this.view.setElement(this.$('.js-view')).render();
      this.listenTo(this.view, 'close', this.hide);
    }

    //this.$el.addClass('is-active');
    //$(document).on('click.confirm_inline' + this.cid
    //  , this.onClickOutside
    //);

    this.isRendered = true;
    return this;
  },

  hide: function() {
    if (!this.isRendered) return this;
    //this.$el.removeClass('is-active');
    if (this.view) {
      this.$el.html();
      this.stopListening(this.view);
    }
    this.$el.addClass('is-hidden');
    //this.$el.detach();
    $document.off('click.confirm_inline' + this.cid);
    this.trigger('hide', this);
    this.isRendered = false;
    return this;
  },

  hideSelfOnOtherShown: function(other) {
    if (this !== other) this.hide();
  },

  onClickOutside: function(e) {
    if (this.$el.has(e.target).length === 0 && document.contains(e.target)) {
      this.hide();
    }
  }

});
