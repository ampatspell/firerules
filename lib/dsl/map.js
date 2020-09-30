const Block = require('./block');
const { clone, assign } = require('./util');

class Map extends Block {

  get modelName() {
    return 'map';
  }

  get key() {
    return this.opts.key;
  }

  mergeNodes(parent) {
    let map = parent.nodes.find(node => node.modelName === 'map' && node.key === this.key);
    let cloned;
    if(!map) {
      map = this.clone(parent);
      cloned = map;
    } else {
      map.opts = assign({}, clone(map.opts), clone(this.opts));
    }

    this.mergeNodesWithParent(map);

    return cloned;
  }

}

module.exports = Map;
