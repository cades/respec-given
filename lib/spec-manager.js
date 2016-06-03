var Stack = require('./stack')

var suiteStack = Object.create(Stack, {
  _arr: { writable: true, configurable: true, value: [] }
})

var SpecManager = {
  current: function() { return suiteStack.top() },
  currentSuite: function() { return this.current().suite },
  currentContext: function() { return this.current().context },
  enter: function(suite) {
    var context = suiteStack.empty() ? {} : Object.create(this.currentContext())
    suiteStack.push({
      suite: suite,
      context: context,
      givens: [],
      whens: [],
      invariants: [],
      ands: []
    })
  },
  exit: function() { suiteStack.pop() },
  addTestToCurrent: function(test) { this.currentSuite().addTest(test) },
  addThenToCurrent: function(test) { this.currentSuite().addTest(test) },
  addGivenToCurrent: function(fn) { this.currentSuite().beforeEach(fn) },
  addWhenToCurrent: function(fn) { this.currentSuite().beforeEach(fn) }
}

module.exports = SpecManager
