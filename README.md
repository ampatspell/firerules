# Firerules

Firestore rules javascript DSL and generator.

> Proof of concept. Minor API changes might happen soon.

``` bash
$ node ./examples/dsl.js # dsl-only
$ node ./examples/generate.js # full example (dsl & ejs)
```

## Sample

``` javascript
// firestore.js
const { generate } = require('firerules');

generate(__dirname, 'firestore.rules', function() {

  this.helper.block('token', function() {
    return this.prop('_token').type('string').optional().writable();
  });

  this.helper.block('type', function(values, creatable=true) {
    let node = this.prop('type').type('string').values(values);
    if(creatable) {
      this.create(function() {
        this.prop('type').writable();
      });
    }
    return node;
  });

  this.define('thing', function() {

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

});
```

``` ejs
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /things/{id} {
      allow read: if true;
      allow create: if <%= doc('thing').create() %>;
      allow update: if <%= doc('thing').update() %>;
    }

  }
}
```

``` bash
$ node ./examples/generate.js
firestore.rules.ejs → firestore.rules
```

``` firestore.rules
// firestore.rules

// ...

allow create: if
  request.resource.data.keys().toSet().hasOnly([
      "_token",
      "type",
      "book",
      "bookmark",
      "fallback"
  ]) &&
  (
    !("_token" in request.resource.data.keys()) ||
    request.resource.data._token is string
  ) &&
  request.resource.data.type in [ "book", "bookmark" ].toSet() &&
  (
    (
      request.resource.data.type == "book" &&
      !request.resource.data.keys().toSet().hasAny([ "bookmark", "fallback" ]) &&
      (
        (
          !("book" in request.resource.data.keys()) ||
          (
            request.resource.data.book == null ||
            request.resource.data.book is string
          )
        )
      )
    ) ||
    (
      request.resource.data.type == "bookmark" &&
      !request.resource.data.keys().toSet().hasAny([ "book", "fallback" ]) &&
      (request.resource.data.bookmark is string)
    ) ||
    (
      !request.resource.data.keys().toSet().hasAny([ "book", "bookmark" ]) &&
      (request.resource.data.fallback is string)
    )
  );

allow update: if
  request.resource.data.diff(resource.data).affectedKeys().hasOnly([
    "_token",
    "book",
    "size",
    "bookmark",
    "fallback"
  ]) &&
  (
    !("_token" in request.resource.data.keys()) ||
    request.resource.data._token is string
  ) &&
  (
    (
      request.resource.data.type == "book" &&
      !request.resource.data.diff(resource.data).affectedKeys().hasAny([
        "bookmark",
        "fallback"
      ]) &&
      (
        request.resource.data.book is string &&
        (
          (
            resource.data.size is map &&
            request.resource.data.size.diff(resource.data.size).affectedKeys().hasOnly([
              "width",
              "height"
            ])
          ) ||
          request.resource.data.size.keys().toSet().hasOnly([ "width", "height" ])
        ) &&
        request.resource.data.size.width is int &&
        request.resource.data.size.height is int
      )
    ) ||
    (
      request.resource.data.type == "bookmark" &&
      !request.resource.data.diff(resource.data).affectedKeys().hasAny([
        "book",
        "size",
        "fallback"
      ]) &&
      (
        request.resource.data.bookmark is string
      )
    ) ||
    (
      !request.resource.data.diff(resource.data).affectedKeys().hasAny([
        "book",
        "size",
        "bookmark"
      ]) &&
      (
        request.resource.data.fallback is string
      )
    )
  );
```

``` javascript
const firerules = require('firerules');
// {
//   generate: [Function: generate],
//   dsl: {
//     define: [Function: define],
//     helper: {
//       block: [Function],
//       prop: [Function]
//     }
//   },
//   ejs: {
//     render: [Function: render]
//   }
// }
```
