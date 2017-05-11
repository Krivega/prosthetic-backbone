'use strict';

module.exports = function(value, defaultValue) {
  if (value !== undefined) {
    return value;
  }
  return defaultValue;
};
