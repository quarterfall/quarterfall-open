module.exports = function(x, n) {
  let result = 1;
  for (let i = 0; i < n; i += 1) {
    result *= x;
  }
  return result;
};
