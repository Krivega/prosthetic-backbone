'use strict';

const View = require('views/view');
const utils = require('utils');
const vent = require('runtime/vent');
const scroller = require('views/ui/scroller');

const HashScroller = View.extend({
  events: {
    'click a[href*=\\#]:not([href=\\#])': 'onScrollerClick'
  },

  initialize: function() {
    $window.on(this.getEventName('hashchange'), this.onHashChange.bind(this));
    this.listenTo(vent, 'scroll-on-hash', this.onHashChange);
    this.onHashChange();
  },

  onHashChange: function() {
    const hash = utils.getLocationHash();
    if (!hash) return false;
    if (hash.search('=') !== -1) return false;

    const $el = this.$('[data-scroll-id=' + hash + ']:first');

    if ($el.length > 0) {
      scroller.scrollTo($el);
    }
    vent.trigger('scroller:hashchange', hash);

    return true;
  },

  onScrollerClick: function(e) {
    let href = this.$(e.currentTarget).attr('href');
    if (href) {
      href = href.split('#')[1];
    }
    let hash = location.hash;
    if (hash) {
      hash = hash.split('#')[1];
    }
    if (href === hash) {
      this.onHashChange();
    }
  }

});

module.exports = new HashScroller({
  el: $document
});
