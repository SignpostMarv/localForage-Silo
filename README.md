Wrapper to [localForage](https://github.com/mozilla/localForage) for storing
content in self-contained silo

# Example

```javascript
require([
  'Silo.js',
  'localforage'
], function(
  Silo,
  localforage
){
  var
    silo = new Silo('foo')
  ;
  silo.setItem('bar', 'baz');
  localforage.setItem('bar', 'baz');
  silo.keys().then(function(keys){
    console.log(keys); // will give ["bar"]
  });
  localforage.keys().then(function(keys){
    console.log(keys); // will give ["bar", "foo::bar"]
  });
  silo.removeItem('bar');
  localforage.keys().then(function(keys){
    console.log(keys); // will give ["bar"]
  });
})
```

# License

This program is free software; it is distributed under an [Apache License](
  https://github.com/SignpostMarv/localForage-Silo/blob/master/LICENSE
).
