const { define, helper } = require('../lib/dsl');

helper.block('type', function(values) {
  return this.prop('type').type('string').values(values).writable();
});

let root = define(function() {

  this.prop('name').type('string');

  this.create(function() {
    this.prop('name').optional().writable();
  });

  this.update(function() {
    this.if(this.affected('name'), function() {
      this.prop('name').value('pending').optional().writable();
    });
  });

});

const dir = arg => require('util').inspect(arg, { depth: 25 });

console.log();

{
  let hash = root.build('create', 1);
  // console.log(dir(hash.merged));
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
