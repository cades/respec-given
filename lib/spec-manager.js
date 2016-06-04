// example usage:
//
// var stack = Object.create(Stack)
// stack._arr = []
// var specManager = Object.create(SpecManager)
// specManager._suiteStack = suiteStack
//

var SpecManager = {
  current: function() { return this._suiteStack.top() },
  currentSuite: function() { return this.current().suite },
  currentContext: function() { return this.current().context },
  enter: function(suite) {
    var context = this._suiteStack.empty() ? {} : Object.create(this.currentContext())
    this._suiteStack.push({
      suite: suite,
      context: context,
      givens: [],
      whens: [],
      invariants: [],
      ands: []
    })
  },
  addTestToCurrent: function(test) { this.currentSuite().addTest(test) },
  addThenToCurrent: function(test) { this.currentSuite().addTest(test) },
  addGivenToCurrent: function(fn) { this.currentSuite().beforeEach(fn) },
  addWhenToCurrent: function(fn) { this.currentSuite().beforeEach(fn) }
  exit: function() { this._suiteStack.pop() },
}

module.exports = SpecManager
