const { define } = require('../lib/dsl');

let root = define(function() {

  this.prop('type').values([ 'book' ]).writable();

  this.if(this.eq('type', 'book'), function() {

    this.create(function() {
      this.rule('isSignedIn()');
    });

    this.update(function() {
      this.rule('isOwner(uid)');
    });

    this.prop('name').type('string').writable();

  });


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
