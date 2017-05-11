'use strict';
/**
 * Sizes were taken from:
 * @link http://www.zappos.com/c/shoe-size-conversion
 */

module.exports = {

  sizing: {
    US: 1,
    UK: 2,
    EURO: 3
  },

  sizingGroups: {
    YOUTH: 1,
    MEN: 2,
    WOMEN: 3
  },

  shoesBrands: {
    NIKE: 'Nike',
    ADIDAS: 'Adidas',
    PUMA: 'Puma',
    UNDER_ARMOUR: 'Under Armour',
    UMBRO: 'Umbro',
    DIADORA: 'Diadora',
    LOTTO: 'Lotto',
    VIZARI: 'Vizari',
    FILA: 'Fila',
    OTHER: 'Other'
  },

  wearBrands: {
    ADIDAS: 'Adidas',
    NIKE: 'Nike',
    UNDER_ARMOUR: 'Under Armour',
    PUMA: 'Puma',
    REEBOK: 'Reebok',
    JOMA: 'Joma',
    KAPPA: 'Kappa',
    LOTTO: 'Lotto',
    POLO: 'Polo',
    REUSCH: 'Reusch',
    STORELLI: 'Storelli',
    UMBRO: 'Umbro'
  },

  sizesYouthUS: [
    '1', '2.5', '3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7',
    '10.5', '11', '11.5', '12', '12.5', '13', '13.5'
  ],

  sizesMenUS: [
    '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5',
    '11', '11.5', '12', '13', '14', '15', '16'
  ],

  sizesWomenUS: [
    '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5',
    '11', '11.5', '12'
  ],

  sizesYouthUK: [
    '1', '2.5', '3', '3.5', '4', '4.5', '5', '5.5', '6',
    '9.5', '10.5', '11', '11.5', '12', '12.5', '13', '13.5'
  ],

  sizesMenUK: [
    '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5',
    '11', '11.5', '12.5', '13.5', '14.5', '15.5'
  ],

  sizesWomenUK: [
    '2', '2.5', '3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5',
    '9', '9.5', '10'
  ],

  sizesYouthEuro: [
    '27', '28', '29', '30', '30', '31', '31', '32', '33', '33', '34', '34', '35',
    '36', '36', '37', '37', '38', '38', '39'
  ],

  sizesMenEuro: [
    '39', '39', '40', '40-41', '41', '41-42', '42', '42-43', '43', '43-44', '45',
    '46', '47', '48', '49'
  ],

  sizesWomenEuro: [
    '35', '35', '35-36', '36', '36-37', '37', '38', '38-39', '39', '39-40', '40',
    '40-41', '41', '41-42', '42', '42-43'
  ],

  convert: function(size, fromSizing, toSizing, sizingGroup) {
    const fromSizes = this.sizesBySizingAndSizingGroup(fromSizing, sizingGroup);
    const toSizes = this.sizesBySizingAndSizingGroup(toSizing, sizingGroup);
    return toSizes[fromSizes.indexOf(size)];
  },

  sizesBySizingAndSizingGroup: function(sizing, sizingGroup) {
    switch (sizing) {
      case this.sizing.UK:
        switch (sizingGroup) {
          case this.sizingGroups.MEN:
            return this.sizesMenUK;
          case this.sizingGroups.WOMEN:
            return this.sizesWomenUK;
          default:
            return this.sizesYouthUK;
        }
        break;
      case this.sizing.EURO:
        switch (sizingGroup) {
          case this.sizingGroups.MEN:
            return this.sizesMenEuro;
          case this.sizingGroups.WOMEN:
            return this.sizesWomenEuro;
          default:
            return this.sizesYouthEuro;
        }
        break;
      default:
        switch (sizingGroup) {
          case this.sizingGroups.MEN:
            return this.sizesMenUS;
          case this.sizingGroups.WOMEN:
            return this.sizesWomenUS;
          default:
            return this.sizesYouthUS;
        }
        break;
    }
  },

  sizesTranslated: function(sizing, sizingGroup) {
    if (!sizing || !sizingGroup) return [];
    const sizes = [];
    const added = {};
    this.sizesBySizingAndSizingGroup(sizing, sizingGroup).forEach(function(size) {
      if (!added[size]) {
        added[size] = true;
        sizes.push({
          value: size,
          token: size + ''
        });
      }
    });
    return sizes;
  },

  sizingTranslated: function() {
    return [{
      value: this.sizing.US,
      token: 'US Size'
    }, {
      value: this.sizing.UK,
      token: 'UK Size'
    }, {
      value: this.sizing.EURO,
      token: 'Euro Size'
    }];
  },

  sizingGroupsTranslated: function() {
    return [{
      value: this.sizingGroups.YOUTH,
      token: 'Youth'
    }, {
      value: this.sizingGroups.MEN,
      token: 'Men'
    }, {
      value: this.sizingGroups.WOMEN,
      token: 'Women'
    }];
  },

  shoesBrandsTranslated: function() {
    const _this = this;
    const shoesBrands = [];

    Object.keys(this.shoesBrands).forEach(function(brand) {
      shoesBrands.push({
        value: _this.shoesBrands[brand],
        token: _this.shoesBrands[brand]
      });
    });

    return shoesBrands;
  },

  wearBrandsTranslated: function() {
    const _this = this;
    const wearBrands = [];

    Object.keys(this.wearBrands).forEach(function(brand) {
      wearBrands.push({
        value: _this.wearBrands[brand],
        token: _this.wearBrands[brand]
      });
    });

    return wearBrands;
  },

  shoesBrandsArray: function() {
    const _this = this;
    const result = [];
    Object.keys(this.shoesBrands).forEach(function(brand) {
      result.push(_this.shoesBrands[brand]);
    });
    return result;
  },

  isOtherBrand: function(brand) {
    return this.shoesBrandsArray().indexOf(brand) === -1;
  }

};
