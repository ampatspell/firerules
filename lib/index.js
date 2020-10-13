const ejs = require('./ejs');
const dsl = require('./dsl');
const assert = require('assert');

const generate = (root, name, fn) => {

  let defines = {};

  let define = (key, fn) => {
    let node = dsl.define(fn);
    defines[key] = node;
    return node;
  }

  let doc = key => {
    let node = defines[key];
    assert(node, `Definition '${key}' missing`);
    let build = (operation, level) => {
      let { string } = node.build(operation, level);
      return [ '', string ].join('\n');
    };
    return {
      create: level => build('create', level),
      update: level => build('update', level),
      node
    };
  }

  let props = {
    doc
  };

  let set = (key, value) => props[key] = value;

  let ctx = {
    helper: dsl.helper,
    define,
    set
  };

  fn.call(ctx);

  ejs.render(root, name, props);
}

module.exports = {
  generate,
  dsl,
  ejs
}
