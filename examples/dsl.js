const { define, helper } = require('../lib/dsl');

helper.block('token', function() {
  return this.prop('_token').type('string').optional().writable();
});

helper.block('type', function(values, creatable=true) {
  let node = this.prop('type').type('string').values(values);
  if(creatable) {
    this.create(function() {
      this.prop('type').writable();
    });
  }
  return node;
});

let root = define(function() {

  this.token();
  this.type([ 'book', 'bookmark' ]);

  this.if(this.eq('type', 'book'), function() {

    this.prop('book').type('string').writable();

    this.create(function() {
      this.prop('book').optional().nullable();
    });

    this.map('size').define(function() {
      this.prop('width').type('int');
      this.prop('height').type('int');
    });

    this.update(function() {
      this.map('size').writable().define(function() {
        this.prop('width').writable();
        this.prop('height').writable();
      });
    });

  }).elseif(this.eq('type', 'bookmark'), function() {

    this.prop('bookmark').type('string').writable();

  }).else(function() {

    this.prop('fallback').type('string').writable();

  });

});

const dir = arg => require('util').inspect(arg, { depth: 25 });

console.log();

{
  let hash = root.build('create');
  console.log(hash.string);
}

console.log();

{
  let hash = root.build('update');
  console.log(hash.string);
}

console.log();
