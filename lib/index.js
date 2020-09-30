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
    let build = operation => node.build(operation).string;
    return {
      create: () => build('create'),
      update: () => build('update'),
      node
    };
  }

  let ctx = {
    helper: dsl.helper,
    define
  };

  fn.call(ctx);

  ejs.render(root, name, { doc });
}

module.exports = {
  generate,
  dsl,
  ejs
}
