define([
  'localforage'
], function(localforage){
  'use strict';
  var
    siloNameProp = Symbol('siloName')
  ;

  class Silo{
    constructor(siloName){
      this[siloNameProp] = siloName;
    }
    Silo(subSiloName){
      return new Silo(this[siloNameProp] + '::' + subSiloName);
    }
    config(options){
      localforage.config(options);
    }
    getItem(key){
      var
        self = this
      ;
      return new Promise(function(resolve, reject){
        localforage.getItem(self[siloNameProp] + '::' + key).then(
          resolve,
          reject
        );
      });
    }
    setItem(key, value){
      var
        self = this
      ;
      return new Promise(function(resolve, reject){
        localforage.setItem(self[siloNameProp] + '::' + key, value).then(
          resolve,
          reject
        );
      });
    }
    removeItem(key){
      var
        self = this
      ;
      return new Promise(function(resolve, reject){
        localforage.removeItem(self[siloNameProp] + '::' + key).then(
          resolve,
          reject
        );
      });
    }
    key(index){
      var
        self = this
      ;
      return new Promise(function(resolve, reject){
        self.keys().then(
          function(keys){
            if(index >= keys.length){
              reject('out of range');
            }else{
              resolve(keys[index]);
            }
          },
          reject
        );
      });
    }
    keys(){
      var
        self = this
      ;
      return new Promise(function(resolve, reject){
        localforage.keys().then(function(keys){
            resolve(keys.filter(function(key){
              return key.indexOf(self[siloNameProp]) === 0;
            }).map(function(key){
              return key.substring(self[siloNameProp].length + 2);
            }));
          },
          reject
        );
      });
    }
    length(){
      var
        self = this
      ;
      return new Promise(function(resolve, reject){
        self.keys().then(
          function(keys){
            resolve(keys.length);
          },
          reject
        );
      });
    }
    clear(){
      var
        self = this
      ;
      return new Promise(function(resolve, reject){
        var
          abort = false,
          nuked = 0|0,
          makeRemoveItem = function(toNuke){
            return function(key){
              self.removeItem(key).then(
                function(){
                  ++nuked;
                  if(!abort && nuked >= toNuke){
                    abort = true;
                    self.length().then(function(recheckToNuke){
                      if(recheckToNuke > 0){
                        nukeit(recheckToNuke);
                      }else{
                        resolve();
                      }
                    }, reject);
                  }
                },
                function(reason){
                  if(!abort){
                    reject(reason);
                  }
                  abort = true;
                }
              );
            };
          },
          makeRemoveItems = function(toNuke){
            if(toNuke < 1){
              resolve();
            }else{
              nuked = 0|0;
              self.keys().then(function(keys){
                for(var key of keys){
                  makeRemoveItem(toNuke)(key);
                }
              }, reject);
            }
          },
          nukeit = function(toNuke){
            abort = false;
            makeRemoveItems(toNuke);
          }
        ;
        self.length().then(nukeit, reject);
      });
    }
  }

  return Silo;
});
