const Block = require('./block');
const { clone, assign } = require('./util');
const assert = require('assert');

class Map extends Block {

  get modelName() {
    return 'map';
  }

  get key() {
    return this.opts.key;
  }

  type(arg) {
    return this.opt('type', arg);
  }

  mergeNodes(parent) {
    let map = parent.nodes.find(node => node.key === this.key);
    let cloned;
    if(!map) {
      map = this.clone(parent);
      cloned = map;
    } else {
      assert(map.modelName === 'map', `Inconsistent definition for '${this.path}': ${this.modelName} and ${map.modelName}`);
      map.opts = assign({}, clone(map.opts), clone(this.opts));
    }

    this.mergeNodesWithParent(map);

    return cloned;
  }

}

module.exports = Map;
