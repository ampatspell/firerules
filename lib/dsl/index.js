let Block = require('./block');
let Property = require('./property');

let define = cb => (new Block()).define(cb);
let helper = Class => (name, fn) => Class.prototype[name] = fn;

module.exports = {
  define,
  helper: {
    block: helper(Block),
    prop: helper(Property)
  }
}
