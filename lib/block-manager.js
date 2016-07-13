// example usage:
//
// var stack = Object.create(Stack)
// stack._arr = []
// var blockManager = Object.create(BlockManager)
// blockManager._blockStack = stack
//

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
      ands: [],
      cleanups: []
    })
  },
  exit: function() { this._blockStack.pop() },

  addGivenToCurrent: function(fn) { this.current().givens.push(fn) },
  addWhenToCurrent: function(fn) { this.current().whens.push(fn) },
  addThenToCurrent: function(fn) { this.current().thens.push(fn) },
  addInvariantToCurrent: function(fn) { this.current().invariants.push(fn) },
  addAndToCurrent: function(fn) { this.current().ands.push(fn) },
  addCleanupToCurrent: function(fn) { this.current().cleanups.push(fn) },

  allGivens: function() {
    return this._collectAllClausesBy(function(blk){ return blk.givens })
  },
  allWhens: function() {
    return this._collectAllClausesBy(function(blk){ return blk.whens })
  },
  allInvariants: function() {
    return this._collectAllClausesBy(function(blk){ return blk.invariants })
  },
  hasAnyThen: function() {
    return this.current().thens.length > 0
  },
  currentAnds: function() {
    return this.current().ands
  },
  snapshot: function() {
    var cleanupRefs = this._blockStack.toArray().map(function(blk){ return blk.cleanups })
    return {
      allCleanups: function() {
        return cleanupRefs.reduceRight(concat)
      }
    }
  },
  _collectAllClausesBy: function(fn) {
    return this._blockStack.toArray().map(fn).reduceRight(concat)
  }
}

function concat(a, b) {
  return a.concat(b)
}

module.exports = BlockManager
