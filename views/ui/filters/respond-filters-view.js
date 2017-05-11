'use strict';

const _ = require('underscore');

const FiltersView = require('./filters-view');

module.exports = FiltersView.extend({

  changedRespondFilters: [],

  isRespondFilterClosed: true, // NOTE: closed by default

  $respondFilterSelector: null,
  $respondFilterWrapper: null,
  $respondFilterToggle: null,

  events: _.extend({
    'click .js-respond-filter-reset': 'onRespondFilterReset',
    'click .js-respond-filter-dropdown-close': 'onRespondFilterDropdownCloseClick',
    'click .js-respond-filter-selector': 'onRespondFilterSelectorClick'
  }, FiltersView.prototype.events),

  /**
   * @override
   */
  render: function() {
    this.$respondFilterSelector = this.$('.js-respond-filter-selector');
    this.$respondFilterWrapper = this.$('.js-respond-filter-wrapper');
    this.$respondFilterToggle = this.$('.js-respond-filter-toggle');

    // reset filter storage
    // NOTE: target not in storage, cause we work with wrapper instead
    // {
    //    wrapper {node} - respond filter node (closest for target or view)
    //    view {view} - reference for external view
    //    isChanged {boolean} - state for this target or view; for counter
    // }
    this.respondFiltersStorage = [];
    // add initial inputs
    const $inputs = this.$('select, input, checkbox');
    $inputs.each((index, item) => {
      this.addRespondFilterByTarget(this.$(item));
    });
    this.toggleSelector();
  },

  // ------- target -----------

  addRespondFilterByTarget: function($target) {
    const $wrapper = this.getWrapper($target);
    if (!$wrapper) {
      return;
    }

    const isChanged = this.getIsChanged($target);
    $wrapper.toggleClass('is-changed', isChanged);

    this.respondFiltersStorage.push({
      wrapper: $wrapper.get(0),
      target: $target.get(0),
      isExcluded: $wrapper.hasClass('is-excluded'),
      isChanged
    });
  },

  getIsChanged: function($target) {
    return $target.is(':checkbox') ? $target.prop('checked') : !!$target.val();
  },

  updateRespondFilterByTarget: function($target) {
    const $wrapper = this.getWrapper($target);
    if (!$wrapper) {
      return;
    }

    const filter = this.getRespondFilterByWrapper($wrapper.get(0));
    // work only with early registered (added) filters
    if (!filter) {
      return;
    }

    const isChanged = this.getIsChanged($target);

    // update
    $wrapper.toggleClass('is-changed', isChanged);
    // update in storage too
    filter.isChanged = isChanged;
  },

  getRespondFilterByWrapper: function(wrapper) {
    // searching for cached target
    const findedItemIndex = this.respondFiltersStorage.findIndex((item) => {
      // compare nodes, not jquery objects
      return item.wrapper === wrapper;
    });
    // NOTE: return by reference
    return findedItemIndex > -1 ? this.respondFiltersStorage[findedItemIndex] : null;
  },

  resetFilterByTarget: function(filter) {
    const $target = this.$(filter.target);
    if ($target.is(':checkbox')) {
      $target.prop('checked', false);
    } else {
      $target.val('');
    }
    $target.trigger('change');
  },

  // ------- view -----------

  addRespondFilterByView: function(view) {
    const $target = view.$el;

    const $wrapper = this.getWrapper($target);
    if (!$wrapper) {
      return;
    }

    const isChanged = !!view.val();

    $wrapper.toggleClass('is-changed', isChanged);

    this.respondFiltersStorage.push({
      wrapper: $wrapper.get(0),
      view,
      isExcluded: $wrapper.hasClass('is-excluded'),
      isChanged
    });
    // view are added manually, so we need to toggle this manually too
    this.toggleSelector();
  },

  updateRespondFilterByView: function(view) {
    const filter = this.getRespondFilterByView(view);
    // work only with early registered (added) filters
    if (!filter) {
      return;
    }

    const isChanged = !!view.val();
    // update
    this.$(filter.wrapper).toggleClass('is-changed', isChanged);
    // update in storage too
    filter.isChanged = isChanged;
    // view are updated manually, so we need to toggle this manually too
    this.toggleSelector();
  },

  getRespondFilterByView: function(view) {
    // searching for cached target
    const findedItemIndex = this.respondFiltersStorage.findIndex((item) => {
      // compare nodes, not jquery objects
      return item.view === view;
    });
    // NOTE: return by reference
    return findedItemIndex > -1 ? this.respondFiltersStorage[findedItemIndex] : null;
  },

  // -------- common ----------

  getWrapper: function($target) {
    const $wrapper = $target.closest('.js-respond-filter');
    if ($wrapper.length) {
      return $wrapper;
    }
  },

  toggleDropdown: function(isClosed) {
    this.isRespondFilterClosed = isClosed;
    this.$respondFilterWrapper.toggleClass('is-closed', isClosed);
    this.$respondFilterToggle.toggleClass('is-active', !isClosed);
  },

  toggleSelector: function() {
    const isHide = this.getRespondFiltersCount() === 0;
    // close dropdown
    this.toggleDropdown(isHide || this.isRespondFilterClosed);
    // and hide selector
    this.$respondFilterSelector.toggleClass('is-hidden', isHide);
  },

  getRespondFiltersCount: function() {
    return _.reduce(this.respondFiltersStorage, (memo, item) => {
      // here we count how many filters into dropdown
      if (!item.isChanged && !item.isExcluded) {
        return memo + 1;
      } else {
        return memo;
      }
    }, 0);
  },

  resetRespondFilter: function($resetEl) {
    const $wrapper = this.getWrapper($resetEl);
    const filter = this.getRespondFilterByWrapper($wrapper.get(0));
    if (!filter) {
      return;
    }

    filter.isChanged = false;

    if (filter.view) {
      this.resetFilterByView(filter);
    } else {
      this.resetFilterByTarget(filter);
    }
  },

  resetFilterByView: function(filter) {
    if (filter.view.val) {
      filter.view.val('');
    }
  },

  onRespondFilterDropdownCloseClick: function() {
    this.toggleDropdown(true);
  },

  onRespondFilterSelectorClick: function() {
    this.toggleDropdown(!this.isRespondFilterClosed);
  },

  onChange: function(e) {
    FiltersView.prototype.onChange.apply(this, arguments);
    if (e && e.currentTarget) {
      this.updateRespondFilterByTarget(this.$(e.currentTarget));
    }
    this.toggleSelector();
  },

  onRespondFilterReset: function(e) {
    this.resetRespondFilter(this.$(e.currentTarget));
    this.toggleSelector();
  }

});
