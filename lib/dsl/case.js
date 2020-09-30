const Block = require('./block');

class Case extends Block {

  get modelName() {
    return 'case';
  }

  get isWritable() {
    return true;
  }

}

module.exports = Case;
