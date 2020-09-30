const Property = require('./property');
const Base = require('./base');
const { arrayToString, clone, uniq, quote } = require('./util');

class Block extends Base {

  constructor(parent, opts) {
    super(parent, opts);
    this.nodes = [];
  }

  get modelName() {
    return 'block';
  }

  define(cb) {
    cb.call(this, this);
    return this;
  }

  _add(Class, opts, cb) {
    let node = new Class(this, opts);
    this.nodes.push(node);
    if(cb) {
      return node.define(cb);
    }
    return node;
  }

  prop(key) {
    return this._add(Property, { key });
  }

  map(key) {
    let Map = require('./map');
    return this._add(Map, { key });
  }

  operation(operation, cb) {
    let Operation = require('./operation');
    return this._add(Operation, { operation }, cb);
  }

  create(cb) {
    return this.operation('create', cb);
  }

  update(cb) {
    return this.operation('update', cb);
  }

  if(condition, cb) {
    let If = require('./if');
    let Case = require('./case');
    let node = this._add(If);
    node._add(Case, { condition }, cb);
    return node;
  }

  clone(parent) {
    return new this.constructor(parent, clone(this.opts));
  }

  nodesForOperation(operation, parent) {
    let block = this.clone(parent);
    this.nodes.forEach(node => {
      block.nodes.push(...node.nodesForOperation(operation, block));
    });
    return [ block ];
  }

  get isWritable() {
    return !this.parent || this.opts.writable;
  }

  writableNodes(parent) {
    if(!this.isWritable) {
      return;
    }
    let block = this.clone(parent);
    this.nodes.forEach(node => {
      let cloned = node.writableNodes(block);
      if(cloned) {
        block.nodes.push(cloned);
      }
    });
    return block;
  }

  mergeNodesWithParent(parent) {
    this.nodes.forEach(node => {
      let merged = node.mergeNodes(parent);
      if(merged) {
        parent.nodes.push(merged);
      }
    });
  }

  mergeNodes(parent) {
    let block = this.clone(parent);
    this.mergeNodesWithParent(block);
    return block;
  }

  renderKeys(type, keys, operation) {
    let props = arrayToString(keys);
    let before = this.pathWithPrefix('resource.data');
    let after = this.pathWithPrefix('request.resource.data');
    let create = `${after}.keys().toSet().${type}(${props})`;
    let update = `${after}.diff(${before}).affectedKeys().${type}(${props})`
    if(operation === 'create') {
      return create;
    } else if(operation === 'update') {
      if(this.key) {
        let map = `${before} is map`;
        return `((${map} && ${update}) || ${create})`;
      }
      return update;
    }
    throw new Error(`Unsupported '${operation}' operation`);
  }

  renderNodes(operation) {
    let { key, opts } = this;

    let keys = [];
    let strings = [];
    this.nodes.forEach(node => {
      let rendered = node.renderNodes(operation);
      if(rendered.keys) {
        keys.push(...rendered.keys);
      }
      if(rendered.string) {
        strings.push(rendered.string);
      }
    });

    keys = uniq(keys);

    let string = this.renderKeys('hasOnly', keys, operation);

    string = [ string, ...strings ].join(' && ');

    let after = this.pathWithPrefix('request.resource.data');

    if(opts.nullable) {
      let nullable = `${after} == null`;
      string = `(${nullable} || (${string}))`;
    }

    if(opts.optional) {
      let optional = `!("${opts.key}" in ${after}.keys())`;
      string = `(${optional} || (${string}))`;
    }

    return {
      keys: [ key ],
      string
    };
  }

  build(operation) {
    let [ extracted ] = this.nodesForOperation(operation);
    let merged = extracted.mergeNodes();
    let writable = merged.writableNodes();
    let { string } = writable.renderNodes(operation);
    return {
      operation,
      extracted,
      merged,
      writable,
      string
    };
  }

  //

  data(arg) {
    let prefix = 'request.resource.data';
    if(!arg) {
      return prefix;
    }
    return `${prefix}.${arg}`;
  }

  cmp(key, cmp, value) {
    return `${this.data(key)} ${cmp} ${quote(value)}`;
  }

  eq(key, value) {
    return this.cmp(key, '==', value);
  }

}

module.exports = Block;