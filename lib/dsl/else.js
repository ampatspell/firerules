const Block = require('./block');

class Else extends Block {

  get modelName() {
    return 'else';
  }

  get isWritable() {
    return true;
  }

}

module.exports = Else;
