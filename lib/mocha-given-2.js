var Mocha = require('mocha'),
    Suite = require('mocha/lib/suite'),
    Test  = require('mocha/lib/test'),
    _     = require('lodash'),
    documentationify = require('./documentationify'),
    SpecManager = require('./spec-manager')

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
  var specManager = Object.create(SpecManager)
  specManager.enter(suite)

  suite.on('pre-require', function(context, file, mocha) {

    // traditional describe/it BDD interface

    context.describe = context.context = function(title, fn) {
      var suite = Suite.create(specManager.currentSuite(), title)
      suite.file = file
      specManager.enter(suite)
      fn.call(specManager.currentContext()) // `this` of describe/context
      specManager.exit()
      return suite
    }

    context.it = context.specify = function(title, fn) {
      var test = new Test(title, fn)
      test.file = file
      specManager.addTestToCurrent(test)
      return test
    }

    context.xdescribe = context.xcontext = context.describe.skip = context.context.skip = function(title, fn) {
      var suite = Suite.create(specManager.currentSuite(), title)
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
          specManager.addGivenToCurrent(fn)
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

      specManager.addGivenToCurrent(function() {
        var cache = null
        var evaluated = false
        var evaluate = fn ? fn : function() { return args[1] }
        var that = this

        Object.defineProperty(this, assignTo, { // replace this with specManager.currentContext()
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
          specManager.addWhenToCurrent(fn)
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
        specManager.addWhenToCurrent(function(done){
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
        specManager.addWhenToCurrent(function(done){
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
        specManager.addWhenToCurrent(function(done){
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
      specManager.addThenToCurrent(test)
    }

    context.And = function() {
      var label = _.findFirstThatIsString(arguments)
      var fn = _.findFirstThatIsFunction(arguments)

      
    }

    context.Then.skip = context.xit
  })
}
