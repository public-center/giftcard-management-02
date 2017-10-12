"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatFloat = formatFloat;
/**
 * Set float to a fixed amount of decimals
 * @param val Income value
 * @param decimal Decimal length
 * @return {Number}
 */
function formatFloat(val) {
  var decimal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;

  return parseFloat(val.toFixed(decimal));
}
//# sourceMappingURL=number.js.map
