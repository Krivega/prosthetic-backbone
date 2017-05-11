/**
 *  Application Utils
 */
'use strict';

// @todod _t() doesn't work in server environment here

const _ = require('underscore');
const $ = require('jquery');
const getState = require('../../app/utils/state');
const config = require('./config');
const configGeneral = require('../../config-general');
const moneyFormatterMixing = require('./libs/money');
const datetimeMixin = require('./libs/datetime');

let utils;

/** @module utils */
module.exports = utils = _.extend({}, datetimeMixin, moneyFormatterMixing, {

  parseCssMods: function(block, modifiers, sep) {
    if (!modifiers) return '';
    if (_.isString(modifiers)) modifiers = [modifiers];
    sep = sep === undefined ? '--' : sep;
    let result = '';

    for (let i = 0, l = modifiers.length; i < l; i++) {
      if (modifiers[i]) {
        result += ' ' + block + sep + modifiers[i];
      }
    }
    return result;
  },

  /**
   * Get prefixed API URL
   *
   * @param {string} url
   * @returns {string} Prefixed api url
   */
  getApiUrl: function(url) {
    return config.apiURL + '/api/' + _t('lang') + url;
  },

  /**
   * Get Absolute URL
   *
   * @param {string} url - Relative url
   * @returns {string} Absolute url
   */
  getAbsoluteUrl: function(url) {
    return configGeneral.hostProtocol + configGeneral.host + url;
  },

  /**
   * Check for Absolute url
   *
   * @param {string} url
   * @returns {boolean} Result of check
   */
  isAbsoluteUrl: function(url) {
    if (!url) return false;
    url = url + '';
    return url.indexOf('http') === 0 || url.indexOf('//') === 0;
  },

  isExternalUrl: function(url) {
    if (!url) {
      return false;
    }
    if (this.isAbsoluteUrl(url)) {
      // remove http:// | https:// | // from the beginning of the url
      url = url.replace(/^((https?:)?\/\/)/, '');
      return url.indexOf(config.host) !== 0;
    }
    return false;
  },

  /**
   * Open new window
   * Returns new window object or undefined if can't open window
   *
   * @param {string} url
   * @returns {object|undefined}
   */
  windowOpen: function(url) {
    const params = 'height=1000,width=1000';
    const win = window.open(url, '_blank', params);
    win.focus();
    return win;
  },

  /**
   *  Capitalize the 1st letter of the string
   *
   *  @param {string} str
   *  @return {string}
   */
  capitalize: function(str) {
    return str ? (str.substr(0, 1).toUpperCase() + str.substr(1)) : '';
  },

  /**
   *  Capitalize all letter of the string
   *
   *  @param {string} str
   *  @return {string}
   */
  capitalizeAll: function(str) {
    return str.replace(/(?:^|\s|\-|\')\S/g, function(a) {
      return a.toUpperCase();
    });
  },

  /**
   * @typedef Error
   * @type {object}
   *
   * @property {field} field - field name.
   * @property {body} body - field's description.
   *
   */

  /**
   *  Formats errors in common format
   *
   *  @param {object} response
   *  @param {Array.<Error>} response.messages - list of errors
   *  @param {number} response.status
   *  @return {object} Formatted errors object
   */
  formatErrors: function(response) {

    let errorData;
    const status = _.has(response, 'status') ? response.status : '';
    const statusText = _.has(response, 'statusText') ?
      response.statusText : 'Application error';

    if (_.has(response, 'responseText')) {
      try {
        errorData = $.parseJSON(response.responseText);
      } catch (e) {
        errorData = null;
      }
    } else if (_.has(response, 'messages')) {
      // here response is already correct json with error data
      errorData = response;
    }

    if (!errorData) {
      // sometimes responseText is not in JSON
      errorData = {
        messages: [{
          field: null,
          body: status > 0 ? (status + ' ' + statusText) : statusText // only add status if > 0
        }]
      };
      if (status === 503) {
        errorData.messages = [{
          field: null,
          body: 'Service is unavailable.<br>Please try again later'
        }];
      }
    }

    if (_.has(response, 'status')) errorData.status = status;

    return errorData;

  },

  /**
   *  Serializes form to object
   *
   *  @param {object} element - HTML element
   *  @param {{visible: boolean, disabled: boolean}} options - Contain visible(to filter)
   *  and disabled(adds this attribute to the element) properties
   *  @param {boolean} options.visible - only visible
   *  @param {boolean} options.disabled - has disabled
   *  @return {object} Serializes
   */
  serializeObject: function(element, options) {
    options = options || {};
    const $el = $(element);
    let $inputs = $el.is('form') || $el.is(':input') ? $el : $el.find(':input');
    if (options.visible) {
      if ($el.is('form')) $inputs = $inputs.find(':input');
      $inputs = $inputs.filter(':visible');
    }
    let $disabled;

    if (options.disabled && $inputs.is('form')) {
      $disabled = $inputs.find(':disabled').removeAttr('disabled');
    } else if (options.disabled) {
      $disabled = $inputs.filter(':disabled').removeAttr('disabled');
    }

    const params = $inputs.serializeArray();

    if (options.disabled) {
      $disabled.attr('disabled', 'disabled');
    }

    const $checkboxes = $inputs.is('form') ?
      $inputs.find('[type=checkbox]') : $inputs.filter('[type=checkbox]');
    const o = {};
    $.each(params, function() {
      if (this.name in o) {
        if (!$.isArray(o[this.name])) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value);
      } else if ($checkboxes.filter('[name=' + this.name + ']').length > 0) {
        o[this.name] = [this.value];
      } else {
        o[this.name] = this.value;
      }
    });
    return o;
  },

  fillForm: function($form, data) {
    _.each(data, function(value, key) {
      const $el = $form.find('[name=' + key + ']');
      if ($el.is(':checkbox')) {
        if (_.isObject(value)) {
          if (!_.isArray(value)) value = _.values(value);
          _.each(value, (valueItem) => {
            $el.filter('[value="' + valueItem + '"]').prop('checked', true);
          });
        } else {
          $el.prop('checked', value);
        }
      } else if ($el.is(':radio')) {
        $el.val([value]);
      } else {
        $el.val(value);
      }
    }, this);
  },

  /**
   *  Extract file name from path
   *
   *  @param {string} path - Path to file
   *  @return {string} File name
   */
  getFileName: function(path) {
    return ('' + path).split(/(\\|\/)/g).pop();
  },

  /**
   * Adds language prefix to given URL
   *
   * @param {string} url
   * @param {boolean} saveGet - need to add search string
   * @return {string} Url with language prefix
   */
  toLangUrl: function(url, saveGet) {
    if (saveGet === true) url += window.location.search;
    return (getState().absoluteUrls ? configGeneral.siteURL : '') + '/' + this.getLang() + url;
  },

  /**
   * Get language
   * Such like as 'en', 'en-us', 'en-gb' and other
   *
   * @return {string}
   */
  getLang: function() {
    return getState().lang;
  },

  /**
   * Get edition
   * Such like as 'en', 'en_us', 'en_gb' and other
   *
   * @return {string}
   */
  getEdition: function() {
    return this.getLang().replace('-', '_');
  },

  /**
   * @returns {boolean}
   */
  isNGEdition: function() {
    return this.getEdition() === 'ng';
  },

  /**
   *  Escape string
   *
   *  @param {string} str
   *  @return {string} Escaped string
   */
  escapeRegExp: function(str) {
    return String(str || '').replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  },

  /**
   *  Return params from current url
   *
   *  @param {string} name - Specify param name to get exact value
   *  @return {object} Parameters object or specified parameter value
   */
  getParams: function(name) {
    const getUrl = this.getUrlQuery();
    let params;
    let paramItem;
    let paramsObj = {};
    let paramName;
    let paramValue;

    if (getUrl !== '') {
      params = (getUrl.substr(1)).split('&');
      for (let i = 0; i < params.length; i++) {

        paramItem = params[i].split('=');
        paramName = decodeURIComponent(paramItem[0]).replace(/\+/g, ' ');
        paramValue = decodeURIComponent(paramItem[1]).replace(/\+/g, ' ');

        if (paramName.slice(-2) === '[]') {
          paramName = paramName.slice(0, -2);
          if (!_.isArray(paramsObj[paramName])) {
            paramsObj[paramName] = [];
          }
          paramsObj[paramName].push(paramValue);
        } else {
          paramsObj[paramName] = paramValue;
        }

      }
    }
    if (name) {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      return paramsObj[name];
    }
    return paramsObj;
  },

  /**
   *  Convert object to query string
   *
   *  @param {object} obj
   *  @return {string} Query string
   */
  objectToUrlParams: function(obj) {
    return $.param(this.filterEmptyProps(obj));
  },

  /**
   *  Remove empty property from object
   *
   *  @param {object} obj
   *  @return {object} Without empty property
   */
  filterEmptyProps: function(obj) {
    const keys = Object.keys(obj);

    _.each(keys, function(key) {
      if (obj[key] === '' ||
        obj[key] === null ||
        obj[key] === undefined ||
        obj[key] === 0
      ) {
        delete obj[key];
      }
    });

    return obj;
  },

  /**
   * It is optimized version of _.omit
   * Returns a clone of passed object without passed properties
   * @param {object} obj
   * @param {array} properties
   */
  omit: function(obj, properties) {
    const result = _.clone(obj);
    if (!properties) {
      return result;
    }
    properties.forEach((prop) => {
      delete result[prop];
    });
    return result;
  },

  /**
   *  Get search query string
   *
   *  @return {string} Search query string
   */
  getUrlQuery: function() {
    let urlQuery = window.location.search;
    let hash;
    if (!urlQuery && this.getLocationHash(true)) {
      hash = this.getLocationHash(true);
      if (hash.split('?').length === 2) {
        urlQuery = '?' + (hash.split('?')[1]).toString();
      }
    }
    return urlQuery;
  },

  /**
   *  @method hasProp
   *
   *  @description Returns a boolean indicating whether the object
   *  has the specified property
   *
   *  @return {boolean} is has the specified property
   */
  hasProp: {}.hasOwnProperty,

  /**
   *  @method indexOf
   *
   *  @description Returns the first index at which a given element
   *  can be found in the array, the first index or -1 if not found
   *
   *  @return {number}
   */
  indexOf: (function() {
    if (Array.prototype.indexOf) {
      return function(list, index) {
        return list.indexOf(index);
      };
    } else if (_.indexOf) {
      return _.indexOf;
    }
  })(),

  /**
   *  Serialize data
   *
   *  @param {object} data
   *  @return {string} Serialized data
   */
  serialize: function(data) {
    if (typeof data.serialize === 'function') {
      return data.serialize();
    } else if (typeof data.toJSON === 'function') {
      return data.toJSON();
    } else {
      throw new TypeError('utils.serialize: Unknown data was passed');
    }
  },

  /**
   *  @description Create a stack of requests
   */
  StackRequests: function() {
    this.request = null;
    this.newRequestPending = false;
    /**
     * You can pass jXHR object as a param or a function that returns jXHR
     * @param request
     * @returns {null}
     */
    this.on = function(request) {
      this.newRequestPending = true;
      this.abortRequest();
      if (typeof request === 'function') {
        request = request();
      }
      this.request = request;

      this.newRequestPending = false;
      return this.request;
    };

    this.abortRequest = function() {
      if (this.request) {
        if (this.request.readyState &&
          this.request.readyState > 0 &&
          this.request.readyState < 4)
        {
          if(this.request.abort) this.request.abort();
        }
        this.request = null;
      }
    };

    this.isLoading = function() {
      if (this.newRequestPending) return true;
      if (!this.request) return false;
      return this.request.readyState > 0 && this.request.readyState < 4;
    };
  },

  /**
   *  @description Generate url's id
   *
   *  @param {string} token
   *  @param {string} prefix
   *
   *  @return {string} id
   */
  generateUrlId: function(token, prefix) {
    if (!token) {
      return '';
    }
    const id = prefix + token;
    return id.toLowerCase()
      .replace(/\W+/g, '-') // replace non symbols
      .replace(/-{2,}/g, '') // replace more than 2 "-" in a row
      .replace(/^-/) // replace "-" in the beginning
      .replace(/-$/, ''); // replace "-" in the end
  },

  /**
   *  @description Strip html tags from a string
   *
   *  @param {string} html
   *  @return {string} String without html tags
   */
  stripTags: function(html) {
    return html.replace(/<\/?[^>]+>/g, '');
  },

  /**
   *  @description Get location hash
   *
   *  @param {boolean} withParams - hash with params or without
   *  @return {(boolean|string)} If hash not found then return false
   *  else return hash string
   */
  getLocationHash: function(withParams = false) {
    const hash = location.hash.replace('#', '');
    if (!hash) return false;
    if (withParams) {
      return hash;
    }
    return hash.split('?')[0];
  },

  /**
   *  @description Get properties from the first object
   *  which are not properties from the second object
   *
   *  @param {object} root - Primary(First) object
   *  @param {object} diff - Second object
   *  @return {object}
   */
  diffObj: function(root, diff) {
    const newObj = {};
    for (const ithem in root) {
      if (diff[ithem] === undefined) newObj[ithem] = root[ithem];
    }
    return newObj;
  },

  /**
   * Append protocle to url if it's required
   *
   * @param  {string} urlString
   * @return {string}
   */
  externalUrl: function(urlString) {
    if (!urlString) return '';

    urlString = urlString.toLowerCase().trim();

    if (urlString.indexOf('http') !== 0 && urlString.indexOf('/') !== 0) {
      return 'http://' + urlString;
    } else {
      return urlString;
    }
  },

  /**
   * Replace parameter placeholders to value of corresponding attributes
   *
   * @param  {string} url Url template
   * @param  {object} obj Parameters hash
   * @return {string}     Formatted url
   */
  formatUrl: function(url, obj) {
    const re = /:([-_A-Za-z0-9]+)/g;

    function replaceParam(str, constiable) {
      if (obj[constiable] !== undefined) {
        return obj[constiable];
      } else {
        throw 'Missing url parameter: ' + constiable + ' is not specified';
      }
    }
    if (url) {
      return url.replace(re, replaceParam);
    } else {
      throw 'Missing url, url is not defined';
    }

  },

  /**
   * Format url and append current lang
   * and add to them a language prefix
   *
   * @param  {string} url Url template
   * @param  {object} obj Parameters hash
   * @param  {object} options Parameters hash;if options.suppressException-then exception wont
   *                  be thrown
   * @return {string} Formatted url with a language prefix
   */
  formatLangUrl: function(url, obj, options) {
    // node does not support default params
    options = options || {};
    try {
      return utils.toLangUrl(utils.formatUrl(url, obj));
    } catch (e) {
      if (options.suppressException) {
        return options.defaultUrl || '#';
      }
      throw e;
    }

  },

  /**
   * Parse a string as JSON
   *
   * @param  {string} json - string in json format
   * @return {object}
   */
  JSONparse: function(json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      return json;
    }
  },

  /**
   * Return JSON object from DOM element
   *
   * @param  {DOM} el
   * @return {object} Will be null if there's no json
   */
  getJSONFromElement: function(el) {
    let result = null;

    if (!el) return result;

    try {
      result = JSON.parse(el.innerHTML);
    } finally {
      return result;
    }
  },

  /**
   * Get absolute image url
   *
   * @param  {string} src - the image URL
   * @return {string} Absolute image url
   */
  getFullMediaSrc: function(src) {
    if (src) {
      return utils.isAbsoluteUrl(src) ? src : configGeneral.staticURL + '/' + src;
    }
    return '';
  },

  /**
   * Get absolute video url
   *
   * @param  {string} src - the video URL
   * @return {string} Absolute video url
   */
  getFullVideoSrc: function(src) {
    return utils.getFullMediaSrc(src);
  },

  /**
   * @description Check a support touch screen
   */
  isSupportTouch: function() {
    return 'ontouchstart' in window;
  },

  /**
   * @description Get the position of the carriage
   *
   * @param {object} input - The HTML element input
   * @return {{start: number, end:number}} Carriage position
   */
  getCaret: function(input) {
    const caret = {
      start: 0,
      end: 0
    };
    if (document.selection) {
      input.focus();
      const sel = document.selection.createRange();
      sel.moveStart('character', -input.value.length);
      caret.start = sel.text.length;
    } else if (input.selectionStart || input.selectionStart === 0) {
      caret.start = input.selectionStart;
      if (input.selectionEnd || input.selectionEnd === 0) {
        caret.end = input.selectionEnd;
      }
    }
    return caret;
  },

  /**
   * @description Set the position of the carriage
   *
   * @param {object} input - The HTML element input
   * @param {{start: number, end:number}} positions Carriage position
   * @param {number} positions.start - begin carriage position
   * @param {number} positions.end - end carriage position
   */
  setCaret: function(input, positions) {
    if (positions.start > positions.end) positions.end = positions.start;
    if (input.setSelectionRange) {
      input.focus();
      input.setSelectionRange(positions.start, positions.end);
    } else if (input.createTextRange) {
      const range = input.createTextRange();
      range.collapse(true);
      range.moveEnd('character', positions.end);
      range.moveStart('character', positions.start);
      range.select();
    }
  },

  /**
   * Substitute values to email template
   *
   * @param  {string} template  Template with placeholders like [Name]
   * @param  {object} map Placeholder-property map, e.g. {'[Name]': 'firstName'}
   * @param {object} values    Object with values, e.g. {firstName: 'John'}
   */
  renderEmailTemplate: function(template, map, values) {
    const keys = Object.keys(map);

    _.each(keys, function(key) {
      const propName = map[key];
      const value = values[propName];
      if (value !== undefined) {
        template = template.replace(key, value);
      }
    });

    return template.trim();
  },

  /**
   * Tells you if the keys and values in properties are contained in object.
   *
   * @param  {object} object
   * @param  {object} properties
   * @param {object} fields - Custom keys
   */
  isMatch: function(object, properties, fields) {
    const keys = fields || Object.keys(properties);
    const obj = _.pick(object, keys);
    return _.isEqual(obj, properties);
  },

  /**
   * Format input email - by removing spaces and keeping caret in correct place
   * @note: only input[type=text] are formatted since caret selection is available only for them
   * @note input[type=email] always returns trimmed value
   *      (to remove head and tail spaces need to set value to empty string before and then trim)
   *
   * @param {object} target - HTML element, like input
   */
  formatInputEmailValue: function(target) {
    let value = target.value || '';
    if (target.type === 'text') {
      const caret = this.getCaret(target);
      value = utils.getFormattedEmail(value);
      const lengthValue = value.toString().length;
      if (target.value.length !== lengthValue) {
        caret.start--;
        caret.end--;
      }
      target.value = value;
      if (lengthValue < caret.start && lengthValue < caret.end) {
        caret.start = lengthValue;
        caret.end = lengthValue;
      }
      utils.setCaret(target, caret);
    } else {
      target.value = this.getFormattedEmail(value);
    }
  },

  getFormattedEmail: function(email) {
    email = email || '';
    return email.replace(/\s/g, '');
  },

  /**
   * Formatting input numeric values
   *
   * @param  {object} target - HTML element, like input
   * @param  {{suffix: string=, prefix: string=, max: number=, min: number=}=} options
   */
  formatInputNumberValue: function(target, options) {
    options = options || {};
    const suffix = options.suffix;
    const prefix = options.prefix;
    const max = options.max;
    const min = options.min;
    let value = target.value || '';
    if (prefix) {
      const valueRegExp = new RegExp(`^${prefix}`);
      value = value.replace(valueRegExp, '');
    }
    if (suffix) {
      const valueRegExp = new RegExp(`${suffix}$`);
      value = value.replace(valueRegExp, '');
    }
    const isStartedToInputFloatNumber = /[.,]$/.test(value.trim());
    value = utils.getFloatNumber(value);
    const caret = this.getCaret(target);
    if (max !== undefined && value > max) value = max;
    if (min !== undefined && value < min) value = min;
    if (min !== undefined && value === '') value = min;

    if (isStartedToInputFloatNumber) {
      value += '.';
      caret.start++;
      caret.end++;
    }
    const lengthValue = value.toString().length;

    if (
      suffix && (
        value ||
        value === 0 ||
        value === ''
      )
    ) {
      value += suffix;
    }

    if (
      prefix && (
        value ||
        value === 0 ||
        value === ''
      )
    ) {
      value = prefix + value;
    }

    target.value = value !== undefined ? value : '';

    if (options.isIgnoreCaret) {
      return;
    }

    if (lengthValue < caret.start && lengthValue < caret.end) {
      caret.start = lengthValue;
      caret.end = lengthValue;
    }
    utils.setCaret(target, caret);
  },

  /**
   * Convert count to human format
   *
   * @param {number} count
   * @return {string} Count in human format
   */
  formatCount: function(count) {
    if (parseInt(count, 10) === 0) return '0';
    const sizes = ['', 'K', 'M', 'G', 'T'];
    const i = parseInt(Math.floor(Math.log(count) / Math.log(1000)), 10);
    const res = count / Math.pow(1000, i);
    const part = res - Math.floor(res);
    return (Math.floor(res) + Number(part.toFixed(1))) + '' + sizes[i];
  },

  /**
   * Check server runtime
   *
   * @return {boolean}
   */
  isServerRuntime: function() {
    return typeof window === 'undefined';
  },

  /**
   * Convert hex to rgb
   *
   * @param  {string} hex - color in HEX format
   * @return {string} color in RGB format
   */
  hexToRgb: function(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : {
      r: '',
      g: '',
      b: ''
    };
  },

  /**
   * Get events based on the type of screen
   *
   * @return {object} supported events
   */
  getEvents: function() {
    let events;
    if ('ontouchstart' in window) {
      events = {
        isTouchEvent: true,
        touchStart: 'touchstart',
        touchMove: 'touchmove',
        touchEnd: 'touchend'
      };
    } else {
      events = {
        isTouchEvent: false,
        touchStart: 'mousedown',
        touchMove: 'mousemove',
        touchEnd: 'mouseup'
      };
    }
    events.changeWindow = 'onorientationchange' in window ? 'orientationchange' : 'resize';
    return events;
  },

  /**
   * Get possessive name
   *
   * @param {string} [name]
   * @return {string} Possessive name
   */
  possessiveName: function(name) {
    if (!name) return '';
    name = (name + '').trim();
    if (name[name.length - 1] === 's') {
      return name + '\'';
    }
    return name + '\'s';
  },

  /**
   * Replace the new line symbol with br HTML tag
   *
   * @param {string} str - string with new line symbols
   * @return {string} Replaced string
   */
  nl2br: function(str) {
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2');
  },

  /**
   * Filter empty properties from object
   */
  filterEmptyObject: function(obj) {
    const keys = Object.keys(obj);

    _.each(keys, function(key) {
      if (obj[key] === '' ||
        obj[key] === null ||
        obj[key] === undefined ||
        obj[key] === 0
      ) {
        delete obj[key];
      }
    });

    return obj;
  },

  /**
   * returns formatted phone, if number is empty - returns empty string.
   * country code can be empty
   *
   * @param {string} phoneNumber
   * @param {string|null} countryCode
   * @param {object|null} options
   * @returns {string}
   */
  formatPhoneNumber: function(phoneNumber, countryCode, options) {
    countryCode = countryCode || '';
    options = options || {};
    if (!phoneNumber) {
      return '';
    }
    if (options.useNonBreakableSpace) {
      return `${countryCode}&nbsp;${phoneNumber}`;
    }
    return `${countryCode} ${phoneNumber}`;
  },

  isEmailLogin: function(login) {
    login = login || '';
    return login.search('@') !== -1;
  },

  isXhrObject: function(xhr) {
    return typeof xhr === 'object' &&
      typeof xhr.always === 'function' &&
      typeof xhr.done === 'function' &&
      typeof xhr.fail === 'function';
  },

  isMetricData: function() {
    return this.getLang() !== 'en-us';
  }

});

global.utils = module.exports;
