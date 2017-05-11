/*
 *  Generic View
 */
'use strict';

const Backbone = require('backbone');
const _ = require('underscore');
const utils = require('utils');

/** @lends BaseView.prototype */
module.exports = Backbone.View.extend({
  options: null,
  defaultOptions: null,
  subviews: null,
  template: null,
  modsClass: null,
  stateClass: null,
  subviewsByName: null,
  _replaceEl: false,

  /**
   * @class BaseView
   * @augments Backbone.View
   * @constructor
   * @property {object}  options
   * @property {array}  subviews
   * @property {function}  template
   * @property {object}  subviewsByName
   * @property {boolean}  _replaceEl
   * @property {string}  name
   * @name BaseView
   */
  constructor: function() {
    this.subviews = [];
    this.subviewsByName = {};
    return Backbone.View.prototype.constructor.apply(this, arguments);
  },

  /**
   * Extract session and vent
   *
   * @param {object} options
   */
  initialize: function(options) {
    this.options = _.defaults(options || {}, this.defaultOptions);
    if (this.options.template) {
      this.template = this.options.template;
    }
    this.state = 'inited'; // available states: inited, loaded
  },

  initModelListeners: function() {},

  initCollectionListeners: function() {},

  render: function() {
    return this.renderDone();
  },

  /**
   * @description Set state loaded and triggered renderDone event
   */
  renderDone: function() {
    this.state = 'loaded';
    this.trigger('renderDone');
    return this;
  },

  renderTemplate: function(options) {
    options = _.clone(options || {});
    if (options.template) {
      this.template = options.template;
      delete options.template;
    }
    let data = {};
    if (this.model && this.model.getTemplateData) {
      data = this.model.getTemplateData();
    } else if (this.collection && this.collection.getTemplateData) {
      data = this.collection.getTemplateData();
    }
    _.extend(data, options);
    if (options.wrapData) {
      delete data.wrapData;
      data = {
        data: data
      };
    }
    return this.renderData(data);
  },

  /**
   * @description Set template
   */
  renderData: function(data) {
    const template = _.result(this, 'template');
    this.$el.html(template.render(data));
    return data;
  },

  /**
   * @description Backbone.View.prototype._removeElement wrapper
   */
  _removeElement: function() {
    if (this._replaceEl === false) {
      return Backbone.View.prototype._removeElement.apply(this, arguments);
    }
  },

  // Set attributes from a hash on this view's element.  Exposed for
  // subclasses using an alternative DOM manipulation API.
  _setAttributes: function(attributes) {
    if (attributes.class && this.modsClass) {
      attributes.class += utils.parseCssMods(attributes.class, this.modsClass);
    }
    if (this.stateClass) {
      attributes.class += utils.parseCssMods('is', this.stateClass, '-');
    }
    return Backbone.View.prototype._setAttributes.call(this, attributes);
  },

  /**
   * @param {object|string} el - DOM element
   * @param {BaseView} view
   * @param {number} [index] - insert subview at specific place
   * @param {boolean} [replace]
   * @return {object} subview
   */
  subRender: function(el, view, index, replace) {
    if (arguments.length === 1) {
      view = el;
      el = this.$el;
    } else if (arguments.length === 3 && arguments[2] === true) {
      view = el;
      el = this.$el;
      replace = true;
      index = undefined;
    }

    const subview = this._prepareAndGetSubview(view);

    this.insertView(el, subview, index, replace);

    subview.render();

    return subview;
  },

  /**
   * @param {object} view
   * @return {object} subview
   */

  _prepareAndGetSubview: function(view) {
    const subviewName = this._getSubviewName(view);
    let subview = this.getSubview(view);

    if (!subview) {
      subview = this.subview(subviewName, view);
    } else {
      // if subview already exists
      subview.delegateEvents();
    }
    return subview;
  },

  /**
   * Find view in subviews array,
   * if not find it then return null
   * else return view
   *
   * @param {Backbone.View} view
   * @return {(Backbone.View|null)} view
   */
  getSubview: function(view) {
    if (!view) return null;
    const subviewName = this._getSubviewName(view);
    return this.subview(subviewName);
  },

  /**
   * @param {object} el - DOM element
   * @param {object} view
   * @return {object} subview
   */
  setElementToSubView: function(el, view) {
    if (arguments.length === 1) {
      view = el;
      el = this.$el;
    }

    return this.subRender(el, view, undefined, true);
  },

  /**
   * @param {object} view
   * @return {object} subview
   */
  subRenderNoInsert: function(view) {
    const subview = this._prepareAndGetSubview(view);

    subview.render();

    return subview;
  },

  /**
   * @param {object} el - DOM element
   * @param {object} view
   * @param {number} index - insert subview at specific place
   * @param {boolean} replace
   * @return {object} view
   */
  insertView: function(el, view, index, replace) {
    const $el = _.isString(el) || !el.jquery ? this.$(el) : el;
    const $children = $el.children();
    if (replace) {
      view.setElement($el);
      // for it was impossible to remove the current(this.$el) element
      view._replaceEl = true;
    } else {
      if (index === undefined || ($children && index >= $children.length) || index < 0) {
        $el.append(view.el);
      } else {
        $children.eq(index).before(view.el);
      }
    }
    return view;
  },

  /**
   * @description Get subview if view not defined else set subview
   *
   * @param {string} name - DOM element
   * @param {object} [view]
   * @return {object} view
   */
  subview: function(name, view) {
    const subviews = this.subviews;
    const byName = this.subviewsByName;
    if (name && view) {
      subviews.push(view);
      byName[name] = view;
    } else if (name) {
      view = byName[name];
    }
    if (view) this.listenTo(view, 'remove', this.onRemoveSubview);
    return view;
  },

  /**
   * @description Get subviews list
   *
   * @param {boolean} [byName] - if true, return subview name list
   * @return {array} subviews list
   */
  getSubviews: function(byName) {
    if (byName) {
      return this.subviewsByName;
    }
    return this.subviews;
  },

  /**
   * @description Get subview name
   *
   * @param {object} viewOrModel
   * @return {string} subview name
   */
  _getSubviewName: function(viewOrModel) {
    return 'itemView:' + viewOrModel.cid;
  },

  /**
   * @description remove subview
   *
   * @param {string|object} nameOrView
   * @return {boolean}
   */
  removeSubview: function(nameOrView) {
    let byName;
    let index;
    let name;
    let otherName;
    let otherView;
    let subviews;
    let view;

    if (!nameOrView) {
      return;
    }
    subviews = this.subviews;
    byName = this.subviewsByName;
    if (typeof nameOrView === 'string') {
      name = nameOrView;
      view = byName[name];
    } else {
      view = nameOrView;
      for (otherName in byName) {
        otherView = byName[otherName];
        if (otherView !== view) {
          continue;
        }
        name = otherName;
        break;
      }
    }
    if (!(name && view)) {
      return;
    }
    this.stopListening(view);
    view.remove();
    index = utils.indexOf(subviews, view);
    if (index !== -1) {
      subviews.splice(index, 1);
    }
    return delete byName[name];
  },

  /**
   * @description remove all subviews
   *
   * @return {object} this
   */
  removeSubviews: function() {
    const _ref = this.getSubviews().slice();
    for (let i = 0, l = _ref.length; i < l; i++) {
      const view = _ref[i];
      const subviewName = this._getSubviewName(view);
      this.removeSubview(subviewName);
    }
    return this;
  },

  /**
   * @description remove itself and remove all subviews
   *
   * @return {object} this
   */
  remove: function() {
    this.removeSubviews();
    Backbone.View.prototype.remove.call(this);
    this.trigger('remove', this);
    return this;
  },

  /**
   * @description clear view
   *
   * @return {object} this
   */
  empty: function() {
    this.$el.empty();
    this.stopListening();
    this.undelegateEvents();
    return this;
  },

  /**
   * @description check state of loaded status
   *
   * @return {boolean}
   */
  isLoaded: function() {
    return this.state === 'loaded';
  },

  /**
   * @description check state of loading status
   *
   * @return {boolean}
   */
  isLoading: function() {
    return this.state === 'loading';
  },

  /**
   * @description set state value and triggered loading event
   */
  startLoading: function() {
    this.state = 'loading';
    this.trigger('loading');
  },

  /**
   * @description call renderDone method
   */
  finishLoading: function() {
    this.renderDone();
  },

  /**
   * @description Add or remove is-hidden class from view element,
   * depending on isHide parameter.
   *
   * @param {boolean} isHide - state
   * @return {object} this
   */
  toggle: function(isHide) {
    this.$el.toggleClass('is-hidden', isHide);
    return this;
  },

  /**
   * @description Add is-fade-in class
   *
   * @return {object} this
   */
  fadeIn: function() {
    this.$el.removeClass('is-fade-out');
    this.$el.addClass('is-fade-in');
    return this;
  },

  /**
   * @description Add is-fade-out class
   *
   * @return {object} this
   */
  fadeOut: function() {
    this.$el.removeClass('is-fade-in');
    this.$el.addClass('is-fade-out');
    return this;
  },

  /**
   * @description Set model to view
   *
   * @return {object} this
   */
  setModel: function(model) {
    if (this.model) this.stopListening(this.model);
    this.model = model;
    this.initModelListeners();
    return this;
  },

  /**
   * @description Get specific event name for event handler this view.
   * this.name should be required to set
   *
   * @param {string} eventName
   * @return {object} Specific event name
   */
  getEventName: function(eventName) {
    return eventName + '.' + this.cid;
  },

  /**
   * @description Set collection
   *
   * @param {Backbone.Collection} collection
   */
  setCollection: function(collection) {
    if (this.collection) this.stopListening(this.collection);
    this.collection = collection;
    this.initCollectionListeners();
  },

  isForm: function() {
    return false;
  },

  /**
   * @description triggered when view removed
   * Remove subview of view
   *
   * @param {object} view
   */
  onRemoveSubview: function(view) {
    this.removeSubview(view);
  }
});
