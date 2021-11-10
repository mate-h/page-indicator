/**
 * Converts a hexadecimal color in #AABBCC format to an [r,g,b] array.
 *
 * @param {*} hex
 * @returns
 */
 export const h2r = function (hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
};