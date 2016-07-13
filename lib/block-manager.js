// example usage:
//
// var stack = Object.create(Stack)
// stack._arr = []
// var blockManager = Object.create(BlockManager)
// blockManager._blockStack = stack
//

function concat(a, b) {
  return a.concat(b)
}

var BlockManager = {
  current: function() { return this._blockStack.top() },
  currentSuite: function() { return this.current().suite },
  enter: function(suite) {
    this._blockStack.push({
      suite: suite,
      givens: [],
      whens: [],
      thens: [],
      invariants: [],
      ands: []
    })
  },
  exit: function() { this._blockStack.pop() },

  addGivenToCurrent: function(fn) { this.current().givens.push(fn) },
  addWhenToCurrent: function(fn) { this.current().whens.push(fn) },
  addThenToCurrent: function(fn) { this.current().thens.push(fn) },
  addInvariantToCurrent: function(fn) { this.current().invariants.push(fn) },
  addAndToCurrent: function(fn) { this.current().ands.push(fn) },

  allGivens: function() {
    return this._blockStack.toArray().map(function(block){ return block.givens }).reduceRight(concat)
  },
  allWhens: function() {
    return this._blockStack.toArray().map(function(block){ return block.whens }).reduceRight(concat)
  },
  allInvariants: function() {
    return this._blockStack.toArray().map(function(block){ return block.invariants }).reduceRight(concat)
  },
  hasAnyThen: function() {
    return this.current().thens.length > 0
  },
  currentAnds: function() {
    return this.current().ands
  }
}

module.exports = BlockManager
