const { define, helper } = require('../lib/dsl');

helper.block('type', function(values) {
  return this.prop('type').type('string').values(values).writable();
});

let root = define(function() {

  this.type([ 'render' ]);

  this.if(this.eq('type', 'render'), function() {

    this.map('request').writable().define(function() {
      this.type([ 'pdf', 'image' ]).writable();
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
