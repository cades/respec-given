var Mocha = require('mocha'),
    Suite = require('mocha/lib/suite'),
    Test  = require('mocha/lib/test'),
    _     = require('lodash'),
    documentationify = require('./documentationify')

_.mixin({
  'findFirstThatIsFunction' : function(arr) {
    return _(arr).find(function (x) {
      return _(x).isFunction()
    })
  },
  'findFirstThatIsString' : function(arr) {
    return _(arr).find(function (x) {
      return _(x).isString()
    })
  }
})


module.exports = Mocha.interfaces['mocha-given-2'] = function(suite) {
  var Stack = {
    top: function() { return this._arr[0] },
    push: function(item) { this._arr.unshift(item) },
    pop: function() { return this._arr.shift() },
    empty: function() { return this._arr.length === 0 }
  }
  var SuiteStack = Object.create(Stack, {
    _arr: { writable: true, configurable: true, value: [] }
  })
  var SpecManager = {
    current: function() { return SuiteStack.top() },
    currentSuite: function() { return this.current().suite },
    currentContext: function() { return this.current().context },
    enter: function(suite) {
      var context = SuiteStack.empty() ? {} : Object.create(this.currentContext())
      SuiteStack.push({
        suite: suite,
        context: context,
        givens: [],
        whens: [],
        invariants: [],
        ands: []
      })
    },
    exit: function() { SuiteStack.pop() },
    addTestToCurrent: function(test) { this.currentSuite().addTest(test) },
    addGivenToCurrent: function(fn) { this.currentSuite().beforeEach(fn) },
    addWhenToCurrent: function(fn) { this.currentSuite().beforeEach(fn) }
  }
  SpecManager.enter(suite)

  suite.on('pre-require', function(context, file, mocha) {

    // traditional describe/it BDD interface

    context.describe = context.context = function(title, fn) {
      var suite = Suite.create(SpecManager.currentSuite(), title)
      suite.file = file
      SpecManager.enter(suite)
      fn.call(SpecManager.currentContext()) // `this` of describe/context
      SpecManager.exit()
      return suite
    }

    context.it = context.specify = function(title, fn) {
      var test = new Test(title, fn)
      test.file = file
      SpecManager.addTestToCurrent(test)
      return test
    }

    context.xdescribe = context.xcontext = context.describe.skip = context.context.skip = function(title, fn) {
      var suite = Suite.create(SpecManager.currentSuite(), title)
      suite.pending = true
      suites.unshift(suite)
      fn.call(suite)
      suites.shift()
    }

    // rspec/given interface

    context.Given = context.Let = function() {
      var assignTo = _.findFirstThatIsString(arguments)
      var fn = _.findFirstThatIsFunction(arguments)
      var args = Array.prototype.slice.call(arguments)

      if (arguments.length === 1) {
        if (_.isFunction(args[0])) {
          SpecManager.addGivenToCurrent(fn)
          return
        }
        if (_.isObject(args[0])) {
          var hash = args[0]
          for (var key in hash) {
            var value = hash[key]
            context.Given(key, value)
          }
          return
        }
      }

      SpecManager.addGivenToCurrent(function() {
        var cache = null
        var evaluated = false
        var evaluate = fn ? fn : function() { return args[1] }
        var that = this

        Object.defineProperty(this, assignTo, { // replace this with SpecManager.currentContext()
          configurable: true, // allow delete and redefine
          get: function() {
            if (!evaluated) {
              evaluated = true
              return cache = evaluate.apply(that)
            }
            return cache
          },
          set: function(newVal) {
            cache = newVal
          }
        })
      })
    }

    context.When = context.GIVEN = context.LET = function() {
      var assignTo = _.findFirstThatIsString(arguments)
      var fn = _.findFirstThatIsFunction(arguments)
      var args = Array.prototype.slice.call(arguments)

      if (arguments.length === 1) {
        if (_.isFunction(args[0])) {
          SpecManager.addWhenToCurrent(fn)
          return
        }
        if (_.isObject(args[0])) {
          var hash = args[0]
          for (var key in hash) {
            var value = hash[key]
            context.When(key, value)
          }
          return
        }
      }

      if (!fn) {
        SpecManager.addWhenToCurrent(function(done){
          var res = args[1]
          var that = this
          if (res && _.isFunction(res.then)) {
            res.then(function onSuccess(resolvedValue) {
              that[assignTo] = resolvedValue
              done()
            }, function onError(error) {
              that[assignTo] = error
              done()
            })
          } else {
            this[assignTo] = res
            done()
          }
        })
        return
      }

      if (fn.length === 0) {
        SpecManager.addWhenToCurrent(function(done){
          var res = fn.apply(this)
          var that = this
          if (res && _.isFunction(res.then)) {
            res.then(function onSuccess(resolvedValue) {
              that[assignTo] = resolvedValue
              done()
            }, function onError(error) {
              that[assignTo] = error
              done()
            })
          } else {
            this[assignTo] = res
            done()
          }
        })
      } else {
        SpecManager.addWhenToCurrent(function(done){
          fn.call(this, function(err, res) {
            if (err) {
              done(err)
              return
            }
            if (res) this[assignTo] = res
            done()
          }.bind(this))
        })
      }

    }

    context.Then = function() {
      var label = _.findFirstThatIsString(arguments)
      var fn = _.findFirstThatIsFunction(arguments)

      var test = new Test(label || documentationify(fn), fn)
      test.file = file
      SpecManager.addTestToCurrent(test)
    }

    context.And = function() {
      var label = _.findFirstThatIsString(arguments)
      var fn = _.findFirstThatIsFunction(arguments)

      
    }

    context.Then.skip = context.xit
  })
}
