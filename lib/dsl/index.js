let Block = require('./block');
let Map = require('./map');
let Property = require('./property');

let define = cb => (new Block()).define(cb);
let helper = (...classes) => (name, fn) => classes.forEach(Class => Class.prototype[name] = fn);

module.exports = {
  define,
  helper: {
    block: helper(Block, Map),
    prop: helper(Property)
  }
}
