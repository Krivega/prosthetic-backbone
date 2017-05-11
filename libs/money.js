'use strict';

const _ = require('underscore');
const convert = require('./convert-utils');

/**
 * @mixin moneyFormatterMixing
 * @description mixin for utils
 * */
module.exports = {

  /**
   * Perform conversion from cents and formatting with currency sign
   * @param {number} value Money value in cents
   * @param {string} currency Currency code, default is USD
   * @returns {string}
   */
  formatMoneyEx: function(value, options) {
    options = options || {};
    const sign = value < 0 ? '-' : '';
    let posfix = '';
    const currencyGlyph = options.currency === 'EUR' ? '&euro;' : '$';

    value = Math.abs(value);
    if (options.round && value > 100000) {
      //posfix = _t('abbrThousand');
      value = Math.ceil(value / 1000);
      posfix = 'K';
    }

    return sign + currencyGlyph +
      this.formatMoney(convert.cents2usd(value), options.noCents) + posfix;
  },

  /**
   * Format money value in USD
   * @return {String}
   * @deprecated use formatMoneyEx if possible
   */
  formatMoney: function(value, noCents) {
    value = value + '';
    return this.formatDollars(value) + (!noCents ? this.formatCents(value) : '');
  },

  /**
   * Returns unformatted input money in cents;
   * @param money
   * @returns {number}
   */
  unFormatMoney: function(money, options) {
    options = _.defaults(options || {}, {
      enableCents: true
    });

    if (!this.isValidMoney(money)) return '';
    if (options.enableCents) {
      money = this.getMoneyWithCents(money);
    } else {
      money = this.getMoneyWithoutCents(money);
    }
    return money;
  },

  /**
   * Returns unformatted input money in cents;
   * @param money
   * @returns {number}
   */
  unFormatMoneyToCents: function(money, options) {
    money = this.unFormatMoney(money, options);
    return convert.usd2cents(money);
  },

  isValidMoney: function(value) {
    if (value === undefined) return false;
    value = value + '';
    value = value.replace(/\$/g, '').replace(/\,/g, '').replace(/\./g, '');
    return +value;
  },

  formatInputMoney: function(target, options) {
    options = _.defaults(options || {}, {
      enableCents: true,
      enable$: true,
      editableCents: true,
      setCaret: false
    });

    const valueOriginal = target.value;
    let valueParsed;
    let caret;
    let caretOffsetStart;
    let caretOffsetEnd;
    let leftOffset = 0;
    let rightOffset = 0;
    let valueIs$ = false;
    if (options.enable$) {
      valueIs$ = valueOriginal[0] === '$';
    }
    if (options.editableCents) {
      valueParsed = this.getMoneyWithCents(valueOriginal, {
        withZeros: true
      });
    } else {
      valueParsed = this.getMoneyWithoutCents(valueOriginal);
      if (options.enableCents) {
        rightOffset = 3;
        valueParsed += '.00';
      }
    }

    valueParsed = this.getFormattedInputMoney(valueParsed, {
      enable$: options.enable$,
      enableCents: options.enableCents
    });

    if (!options.setCaret) {
      target.value = valueParsed;
      return valueParsed;
    }

    caret = this.getCaret(target);
    caretOffsetEnd = (valueOriginal.substring(0, caret.start).split(',')).length - 1;
    target.value = valueParsed;
    // recalculate after update
    caretOffsetStart = (target.value.substring(0, caret.start).split(',')).length - 1;
    if (valueIs$) {
      leftOffset = 1;
    }
    if (rightOffset > 0 && valueParsed.length - caret.start < rightOffset) {
      caretOffsetEnd += rightOffset - (valueParsed.length - caret.start);
    }
    if (caret.start < leftOffset) {
      caretOffsetStart += leftOffset;
    }

    caret.start += caretOffsetStart - caretOffsetEnd;
    caret.end = caret.start;
    this.setCaret(target, caret);

    return valueParsed;
  },

  unFormatInputMoney: function(target, options) {
    options = _.defaults(options || {}, {
      enable$: true
    });

    let money = target.value;

    money = this.unFormatMoney(money, options);
    if (options.enable$) {
      money = '$' + money;
    }

    target.value = money;

    if (options.enable$ && money === '$') {
      setTimeout(() => {
        this.setCaret(target, {
          start: 1,
          end: 1
        });
      }, 0);
    }
    return money;
  },

  getFormattedInputMoney: function(money, options) {
    options = _.defaults(options || {}, {
      enable$: true
    });
    if (options.enable$ && String(money) === '0') {
      return '$' + money;
    }
    const dollars = this.formatDollars(money);
    let moneyFormated = dollars;
    if (options.enableCents) {
      moneyFormated += this.formatCents(money);
    }
    if (!moneyFormated || (+moneyFormated === 0 && moneyFormated !== '0.00')) {
      moneyFormated = '';
    }
    if (options.enable$) {
      moneyFormated = '$' + moneyFormated;
    }
    return moneyFormated;
  },

  formatDollars: function(value) {
    return this.formatNumber(this.extractDollars(value), 0, '.', ',');
  },

  formatCents: function(value, options) {
    options = options || {};
    let cents = this.extractCents(value, {
      withZeros: true
    });
    if (!cents) return '.00';
    for (let i = cents.length; i < 3; i++) {
      cents += '0';
    }
    return cents;
  },

  getOnlyNumber: function(str) {
    str = str ? str + '' : '';
    return str.replace(/[^0-9]+/g, '');
  },

  getFloatNumber: function(str) {
    str = str ? str + '' : '';
    str = str.replace(/[^0-9\.]+/g, '');
    if (str.split('.').length > 1) {
      str = str.split('.')[0] + '.' + str.split('.')[1].substr(0, 2);
    }
    return str === '' ? str : +str;
  },

  getMoneyWithCents: function(money, options) {
    return this.extractDollars(money) + this.extractCents(money, options);
  },

  getMoneyWithoutCents: function(money) {
    return this.extractDollars(money);
  },

  extractDollars: function(money) {
    money = money || '';
    money = money + '';
    const dollars = money.split('.')[0];
    return this.getOnlyNumber(dollars);
  },

  extractCents: function(money, options) {
    options = options || {};
    money = money || '';
    money = money + '';
    let cents = '';
    if (options.withZeros) {
      cents = '.00';
    }
    const tmp = money.split('.');
    if (tmp.length <= 1) {
      return cents;
    }
    cents = tmp[1].substring(0, 2);
    cents = this.getOnlyNumber(cents);
    if (!options.withZeros && cents === '00') {
      return '';
    }
    return '.' + cents;
  },

  /**
   * Format any number
   * @param number - Number
   * @param fractionalDigits - fractional digits
   * @param decimalMark
   * @param thousandsSeparator - thousands separator
   * @returns {string}
   */
  formatNumber: function(number, fractionalDigits, decimalMark, thousandsSeparator) {
    let sign;
    let numberString;
    let thousandsPrefix;
    fractionalDigits = isNaN(fractionalDigits = Math.abs(fractionalDigits)) ? 0 :
      fractionalDigits;
    decimalMark = decimalMark === undefined ? '.' : decimalMark;
    thousandsSeparator = thousandsSeparator === undefined ? ' ' : thousandsSeparator;
    sign = number < 0 ? '-' : '';
    numberString = parseInt(number = Math.abs(+number || 0).toFixed(fractionalDigits)) + '';
    thousandsPrefix = numberString.length > 3 ? numberString.length % 3 : 0;
    return sign +
      (thousandsPrefix ? numberString.substr(0, thousandsPrefix) + thousandsSeparator : '') +
      numberString.substr(thousandsPrefix).
    replace(/(\d{3})(?=\d)/g, '$1' + thousandsSeparator) +
      (fractionalDigits ?
        decimalMark + Math.abs(number - numberString).toFixed(fractionalDigits).slice(2) :
        '');
  },

  sumMoney: function() {
    let result = 0;
    for (let i = 0, max = arguments.length; i < max; i++) {
      result += arguments[i] * 10;
    }
    return result / 10;
  },

  subtractMoney: function(result) {
    result = result || 0;
    result *= 10;
    for (let i = 1, max = arguments.length; i < max; i++) {
      result -= arguments[i] * 10;
    }
    return result / 10;
  }

};
