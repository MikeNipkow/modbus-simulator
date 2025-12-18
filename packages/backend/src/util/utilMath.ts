/**
 * Check if a number is a float.
 * @param n Number to check.
 * @returns True if the number is a float, false otherwise.
 */
export const isFloat = (n: number): boolean => {
  return Number(n) === n && n % 1 !== 0;
};

/**
 * Check if a number is an integer.
 * @param n Number to check.
 * @returns True if the number is an integer, false otherwise.
 */
export const isInteger = (n: number): boolean => {
  return Number(n) === n && n % 1 === 0;
};
