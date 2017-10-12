/**
 * Set float to a fixed amount of decimals
 * @param val Income value
 * @param decimal Decimal length
 * @return {Number}
 */
export function formatFloat(val, decimal = 3) {
  return parseFloat(val.toFixed(decimal));
}
