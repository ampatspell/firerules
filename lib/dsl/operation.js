const Block = require('./block');

class Operation extends Block {

  get modelName() {
    return 'operation';
  }

  nodesForOperation(operation, parent) {
    if(this.opts.operation !== operation) {
      return [];
    }
    let arr = [];
    this.nodes.forEach(node => {
      arr.push(...node.nodesForOperation(operation, parent));
    });
    return arr;
  }

}

module.exports = Operation;
