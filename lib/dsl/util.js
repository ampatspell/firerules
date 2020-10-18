const clone = require('clone');

const {
  assign
} = Object;

const quote = value => {
  if(typeof value === 'string') {
    return `"${value}"`;
  }
  return value;
}

const arrayToString = array => `[ ${array.map(item => quote(item)).join(', ')} ]`;

const pad = (string, level=1) => {
  let prefix = '';
  for(let i = 0; i < level; i++) {
    prefix = `${prefix}  `;
  }
  return string.split('\n').map(line => `${prefix}${line}`).join('\n');
}

const block = string => ([ '(', pad(string), ')' ].join('\n'));

const uniq = arg => {
  let arr = [];
  arg.forEach(item => {
    if(!arr.includes(item)) {
      arr.push(item);
    }
  })
  return arr;
}

class UnquotedString {

  constructor(string) {
    this.string = string;
  }

  toString() {
    return this.string;
  }

}

module.exports = {
  clone,
  quote,
  arrayToString,
  pad,
  block,
  assign,
  uniq,
  UnquotedString
}
