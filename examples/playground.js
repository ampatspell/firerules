const { define } = require('../lib/dsl');

let root = define(function() {

  // this.map('error').writable().define(function() {
  //   this.prop('name').type('string').writable();
  // });

  // this.create(function() {
  //   this.map('error').define(function() {
  //     this.prop('name').type().optional().nullable();
  //   });
  // });

  // this.update(function() {
  //   this.map('error').type().nullable().optional().writable();
  // });

});

const dir = arg => require('util').inspect(arg, { depth: 25 });

console.log();

{
  let hash = root.build('create', 1);
  // console.log(dir(hash.writable));
  // console.log();
  console.log(hash.string);
}

console.log();

{
  let hash = root.build('update', 1);
  // console.log(dir(hash.writable));
  // console.log();
  console.log(hash.string);
}

console.log();
