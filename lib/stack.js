// example usage 1:
// var stack = Object.create(Stack)
// stack._arr = []
//
// example usage 2:
// var stack = Object.create(Stack{
//   _arr: { writable: true, configurable: true, value: [] }
// })
//

var Stack = {
  top: function() { return this._arr[0] },
  push: function(item) { this._arr.unshift(item) },
  pop: function() { return this._arr.shift() },
  empty: function() { return this._arr.length === 0 }
}

module.exports = Stack
