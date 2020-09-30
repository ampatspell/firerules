const hidden = (object, key, value) => Object.defineProperty(object, key, { value });

class Base {

  constructor(parent, opts) {
    hidden(this, 'parent', parent || null);
    this.opts = opts || {};
  }

  get key() {
    let { opts: { key } } = this;
    return key;
  }

  get components() {
    let arr = [];
    let _path = node => {
      let { parent, key } = node;
      if(key) {
        arr.unshift(key);
      }
      if(parent) {
        _path(parent);
      }
    };
    _path(this);
    return arr;
  }

  get path() {
    return this.components.join('.');
  }

  pathWithPrefix(prefix) {
    let { path } = this;
    if(!path) {
      return prefix;
    }
    return `${prefix}.${path}`;
  }

  parentPathWithPrefix(prefix) {
    let { parent } = this;
    if(!parent) {
      return prefix;
    }
    return parent.pathWithPrefix(prefix);
  }

  opt(key, value) {
    this.opts[key] = value;
    return this;
  }

  nullable(arg=true) {
    return this.opt('nullable', arg);
  }

  optional(arg=true) {
    return this.opt('optional', arg);
  }

  writable(arg=true) {
    return this.opt('writable', arg);
  }

}

module.exports = Base;
