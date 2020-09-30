let path = require('path');
let fs = require('fs');
let ejs = require('ejs');

class EJS {

  constructor(root, name, props) {
    this.root = root;
    this.name = name;
    this.props = props;
  }

  _render(root, name, props) {
    name = path.join(root, `${name}.ejs`);
    try {
      let compiled = ejs.compile(fs.readFileSync(name, 'utf-8'), { client: true });
      return compiled(Object.assign({}, props), str => str, (name, props) => this._render(root, name, props));
    } catch(err) {
      err.message = `${name}: ${err.message}`;
      throw err;
    }
  }

  render() {
    let { root, name, props } = this;
    let string = this._render(root, name, props);
    let target = path.join(root, name);
    console.log(`${name}.ejs → ${name}`);
    fs.writeFileSync(target, string);
  }

}

const render = (...args) => (new EJS(...args)).render();

module.exports = {
  render
}
