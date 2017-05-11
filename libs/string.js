'use strict';

var nativeTrim = String.prototype.trim;

function makeString(object) {
  if (object === null) return '';
  return '' + object;
}
function escapeRegExp(str) {
  return makeString(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
}
function defaultToWhiteSpace(characters) {
  if (characters === null) {
    return '\\s';
  } else if (characters.source) {
    return characters.source;
  } else {
    return '[' + escapeRegExp(characters) + ']';
  }
}

/**
 *
 * @class libs\String
 */
module.exports = {

  /**
   * Converts underscored or dasherized string to a camelized one.
   * Begins with a lower case letter.
   * dash or an upper case letter.
   * e.g. moz-transform => mozTransform
   *  -moz-transform => mozTransform
   *  MozTransform => mozTransform
   *
   * @param {string} str
   * @returns {string}
   */
  camelize: function(str) {
    str = this.trim(str).replace(/[-_\s]+(.)?/g, function(match, c) {
      return c ? c.toUpperCase() : '';
    });

    return this.decapitalize(str);
  },

  decapitalize: function(str) {
    str = makeString(str);
    return str.charAt(0).toLowerCase() + str.slice(1);
  },

  trim: function(str, characters) {
    str = makeString(str);
    if (!characters && nativeTrim) return nativeTrim.call(str);
    characters = defaultToWhiteSpace(characters);
    return str.replace(new RegExp('^' + characters + '+|' + characters + '+$', 'g'), '');
  }

};
