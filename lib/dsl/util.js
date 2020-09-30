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

// const pad = (arg, level) => {
//   let prefix = '';
//   for(let i = 0; i < level; i++) {
//     prefix = `${prefix}  `;
//   }
//   return `${prefix}${arg}`;
// }

const uniq = arg => {
  let arr = [];
  arg.forEach(item => {
    if(!arr.includes(item)) {
      arr.push(item);
    }
  })
  return arr;
}

module.exports = {
  clone,
  quote,
  arrayToString,
  // pad,
  assign,
  uniq
}
