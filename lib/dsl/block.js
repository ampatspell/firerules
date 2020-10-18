const Property = require('./property');
const Base = require('./base');
const { arrayToString, clone, uniq, quote, pad, block, assign, UnquotedString } = require('./util');

class Block extends Base {

  constructor(parent, opts) {
    super(parent, assign({ type: true }, opts));
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

  rule(value) {
    let Rule = require('./rule');
    return this._add(Rule, { value });
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
        return block([
          '(',
          pad(`${map} &&`),
          pad(update),
          ') ||',
          create
        ].join('\n'));
      }
      return update;
    }
    throw new Error(`Unsupported '${operation}' operation`);
  }

  renderNodes(operation) {
    let { key, opts } = this;

    let string;
    if(this.opts.type) {

      let keys = [];
      let nested = [];
      this.nodes.forEach(node => {
        let rendered = node.renderNodes(operation);
        if(rendered.keys) {
          keys.push(...rendered.keys);
        }
        if(rendered.string) {
          nested.push(rendered.string);
        }
      });

      keys = uniq(keys);

      let hasOnly = this.renderKeys('hasOnly', keys, operation);
      if(this.path) {
        let path = this.pathWithPrefix('request.resource.data');
        string = [
          `${path} is map &&`,
          hasOnly
        ].join('\n');
      } else {
        string = hasOnly;
      }

      string = [ string, ...nested ].join(' &&\n');

      if(opts.nullable || opts.optional) {
        string = block(string);
      }

      string = [ string ];

    } else {

      string = [];

    }

    if(opts.nullable) {
      let path = this.pathWithPrefix('request.resource.data');
      let nullable = `${path} == null`;
      string = [ nullable, ...string ];
    }

    if(opts.optional) {
      let path = this.parentPathWithPrefix('request.resource.data');
      let optional = `!("${opts.key}" in ${path}.keys())`;
      string = [ optional, ...string ];
    }

    if(string.length === 1) {
      string = string[0];
    } else {
      string = block(string.join(' ||\n'));
    }

    return {
      keys: [ key ],
      string
    };
  }

  build(operation, level) {
    let [ extracted ] = this.nodesForOperation(operation);
    let merged = extracted.mergeNodes();
    let writable = merged.writableNodes();
    let { string } = writable.renderNodes(operation);
    if(level) {
      string = pad(string, level);
    }
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
    let join = prefix => {
      if(!arg) {
        return prefix;
      }
      return `${prefix}.${arg}`;
    };
    return {
      request: join('request.resource.data'),
      resource: join('resource.data')
    };
  }

  unquoted(arg) {
    return new UnquotedString(arg);
  }

  cmp(key, cmp, value) {
    let { request } = this.data(key);
    return `${request} ${cmp} ${quote(value)}`;
  }

  eq(key, value) {
    return this.cmp(key, '==', value);
  }

  split(path) {
    let components = path.split('.');
    let key = components.pop();
    let parent = components.join('.');
    return { key, parent };
  }

  affected(path) {
    let { key, parent } = this.split(path);
    let { request, resource } = this.data(parent);
    return `"${key}" in ${request}.diff(${resource}).affectedKeys()`;
  }

}

module.exports = Block;
