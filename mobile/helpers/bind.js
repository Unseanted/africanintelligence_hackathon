/**
 * Helper function to bind a function to a context
 * @param {Function} fn - The function to bind
 * @param {Object} thisArg - The context to bind to
 * @returns {Function} - The bound function
 */
export default function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
} 