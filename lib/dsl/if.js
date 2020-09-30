const Block = require('./block');
const { uniq } = require('./util');

class If extends Block {

  get modelName() {
    return 'if';
  }

  get isWritable() {
    return true;
  }

  elseif(condition, cb) {
    let Case = require('./case');
    return this._add(Case, { condition }, cb).parent;
  }

  else(cb) {
    let Else = require('./else');
    return this._add(Else, null, cb).parent;
  }

  renderClauseBody(node, operation) {
    let string;
    let keys = [];

    if(!node) {
      return {
        string,
        keys
      };
    }

    let strings = [];
    node.nodes.forEach(node => {
      let rendered = node.renderNodes(operation);
      if(rendered.keys) {
        keys.push(...rendered.keys);
      }
      if(rendered.string) {
        strings.push(rendered.string);
      }
    });

    if(strings.length) {
      string = strings.join(' && ');
      string = `(${string})`;
    }

    return {
      keys,
      string
    };
  }

  renderClause(node, operation) {
    let { keys, string } = this.renderClauseBody(node, operation);
    let { opts: { condition } } = node;
    return {
      keys,
      omit: [],
      string,
      condition
    };
  }

  renderClauses(operation) {
    let nodes = [];

    let caseNodes = this.nodes.filter(node => node.modelName === 'case');
    caseNodes.forEach(node => {
      nodes.push(this.renderClause(node, operation));
    });

    let elseNode = this.nodes.find(node => node.modelName === 'else');
    if(elseNode) {
      nodes.push(this.renderClause(elseNode, operation));
    }

    let keys = [];
    nodes.forEach(node => {

      node.keys.forEach(key => {
        if(!keys.includes(key)) {
          keys.push(key);
        }
      });

      nodes.forEach(other => {
        if(other === node) {
          return;
        }
        other.keys.forEach(key => {
          if(!node.keys.includes(key) && !node.omit.includes(key)) {
            node.omit.push(key);
          }
        });
      });
    });

    return {
      nodes,
      keys
    };
  }

  renderNodes(operation) {
    let { nodes, keys } = this.renderClauses(operation);

    let strings = [];
    nodes.forEach(node => {
      if(!node.string) {
        return;
      }
      let parts = [];
      if(node.condition) {
        parts.push(node.condition);
      }
      if(node.omit.length) {
        parts.push(`!${this.renderKeys('hasAny', uniq(node.omit), operation)}`);
      }
      parts.push(node.string);
      strings.push(`(${parts.join(' && ')})`);
    });

    let string = `(${strings.join(' || ')})`;

    return {
      keys,
      string
    };
  }

}

module.exports = If;
