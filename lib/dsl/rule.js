const Base = require('./base');
const { quote, arrayToString, clone, assign, block } = require('./util');
const assert = require('assert');

class Rule extends Base {

  get modelName() {
    return 'rule';
  }

  clone(parent) {
    return new Rule(parent, clone(this.opts));
  }

  nodesForOperation(operation, parent) {
    let rule = this.clone(parent);
    return [ rule ];
  }

  mergeNodes(parent) {
    return this.clone(parent);
  }

  get isWritable() {
    return true;
  }

  writableNodes(parent) {
    if(!this.isWritable) {
      return;
    }
    let rule = this.clone(parent);
    return rule;
  }

  renderNodes() {

    let string = this.opts.value;

    return {
      keys: [],
      string
    };
  }

}

module.exports = Rule;
