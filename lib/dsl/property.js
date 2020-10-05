const Base = require('./base');
const { quote, arrayToString, clone, assign, block } = require('./util');
const assert = require('assert');

class Property extends Base {

  get modelName() {
    return 'property';
  }

  get key() {
    return this.opts.key;
  }

  type(arg) {
    return this.opt('type', arg);
  }

  value(arg) {
    return this.opt('value', arg);
  }

  values(arg) {
    return this.opt('values', arg);
  }

  clone(parent) {
    return new Property(parent, clone(this.opts));
  }

  nodesForOperation(operation, parent) {
    let property = this.clone(parent);
    return [ property ];
  }

  get isWritable() {
    return this.opts.writable;
  }

  writableNodes(parent) {
    if(!this.isWritable) {
      return;
    }
    let property = this.clone(parent);
    return property;
  }

  mergeNodes(parent) {
    let property = parent.nodes.find(node => node.key === this.key);
    if(!property) {
      return this.clone(parent);
    } else {
      assert(property.modelName === 'property', `Inconsistent definition for '${this.path}': ${this.modelName} and ${property.modelName}`);
      property.opts = assign({}, clone(property.opts), clone(this.opts));
    }
  }

  renderNodes() {
    let { opts, key } = this;

    let prefix = `request.resource.data`;
    let path = this.pathWithPrefix(prefix);

    let string = [];

    if(opts.value !== undefined) {
      string = [ `${path} == ${quote(opts.value)}` ];
    } else if(opts.values) {
      let values = arrayToString(opts.values);
      string = [ `${path} in ${values}.toSet()` ];
    } else if(opts.type) {
      string = [ `${path} is ${opts.type}` ];
    }

    if(opts.nullable) {
      let nullable = `${path} == null`;
      string = [ nullable, ...string ];
    }

    if(opts.optional) {
      let parentPath = this.parentPathWithPrefix(prefix);
      let optional = `!("${opts.key}" in ${parentPath}.keys())`;
      string = [ optional, ...string ];
    }

    if(string) {
      if(string.length === 1) {
        string = string[0];
      } else {
        string = block(string.join(' ||\n'));
      }
    }

    return {
      keys: [ key ],
      string
    };
  }

}

module.exports = Property;
