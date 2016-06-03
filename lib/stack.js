var Stack = {
  top: function() { return this._arr[0] },
  push: function(item) { this._arr.unshift(item) },
  pop: function() { return this._arr.shift() },
  empty: function() { return this._arr.length === 0 }
}

module.exports = Stack
