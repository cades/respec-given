var Mocha = require('mocha'),
    Suite = require('mocha/lib/suite'),
    Test  = require('mocha/lib/test'),
    _     = require('lodash'),
    async = require('async'),
    documentationify = require('./documentationify'),
    factory = require('./factory')

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


module.exports = Mocha.interfaces['respec-given'] = function(suite) {
  blockManager = factory.createBlockManager()
  blockManager.enter(suite)

  suite.on('pre-require', function(context, file, mocha) {

    // traditional describe/it BDD interface

    context.describe = context.context = function(title, fn) {
      var suite = Suite.create(blockManager.currentSuite(), title)
      suite.file = file
      blockManager.enter(suite)
      fn.call(suite) // `this` of describe/context (declaration time)
      blockManager.exit()
    }

    context.it = context.specify = function(title, fn) {
      var test = new Test(title, fn)
      test.file = file
      blockManager.currentSuite().addTest(test)
    }

    context.xdescribe = context.xcontext = context.describe.skip = context.context.skip = function(title, fn) {
      var suite = Suite.create(blockManager.currentSuite(), title)
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
        if (_.isFunction(args[0])) {        // Given(fn)
          blockManager.addGivenToCurrent(fn)
          return
        }
        if (_.isObject(args[0])) {          // Given(hash)
          var hash = args[0]
          for (var key in hash) {
            var value = hash[key]
            context.Given(key, value)
          }
          return
        }
      }

      blockManager.addGivenToCurrent(function() {
        var cache = null
        var evaluated = false
        var evaluate = fn ? fn : function() { return args[1] }  // Given(var, fn), or
        var ctx = this                                          // Given(var, value)  TODO: 只允許 primitive type

        Object.defineProperty(ctx, assignTo, {
          configurable: true, // allow delete and redefine
          get: function() {
            if (!evaluated) {
              evaluated = true
              return cache = evaluate.apply(ctx)
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
        if (_.isFunction(args[0])) {  // When(fn)
          blockManager.addWhenToCurrent(fn)
          return
        }
        if (_.isObject(args[0])) {    // When(hash)
          var hash = args[0]
          for (var key in hash) {
            var value = hash[key]
            context.When(key, value)
          }
          return
        }
      }

      if (!fn) {
        blockManager.addWhenToCurrent(function(done){
          var res = args[1]
          var ctx = this
          if (res && _.isFunction(res.then)) {  // When(result, promise)
            res.then(function onSuccess(resolvedValue) {
              ctx[assignTo] = resolvedValue
              done()
            }, function onError(error) {
              ctx[assignTo] = error
              done()
            })
          } else {                              // When(result, value)
            ctx[assignTo] = res
            done()
          }
        })
        return
      }

      if (fn.length === 0) {                    // When(result, fn)
        blockManager.addWhenToCurrent(function(done){
          // sync. use return value
          var ctx = this
          try {
            var res = fn.apply(ctx)
            if (res && _.isFunction(res.then)) {
              res.then(function onSuccess(resolvedValue) {
                ctx[assignTo] = resolvedValue
                done()
              }, function onError(error) {
                ctx[assignTo] = error
                done()
              })
            } else {
              ctx[assignTo] = res
              done()
            }
          } catch (err) {
            ctx[assignTo] = err
            done()
          }
        })
      } else {                                   // When(result, fn(done))
        blockManager.addWhenToCurrent(function(done){
          // async. use callback
          var ctx = this
          try {
            fn.call(ctx, function(arg1, arg2) {
              // if user choose node-style, pass value via second arg, take it.
              if (typeof arg2 !== 'undefined') {
                ctx[assignTo] = arg2
                done()
                return
              }
              // first arg may be arbitrary value, Error, or undefined. just take it.
              ctx[assignTo] = arg1
              done()
            })
          } catch (err) {
            ctx[assignTo] = err
            done()
          }
        })
      }

    }

    context.Then = function() {
      var label = _.findFirstThatIsString(arguments)
      var fn = _.findFirstThatIsFunction(arguments)
      var givens = blockManager.allGivens(),
          whens = blockManager.allWhens(),
          invariants = blockManager.allInvariants(),
          ands = blockManager.currentAnds()  // keep the reference at this moment. now `ands` is a empty array

      var test = new Test(label || documentationify(fn), function(done) {
        // at this moment, all declaration actions are DONE
        // and the suite stack only contain 1 item: the out-most block.
        // so we can not use blockManager anymore
        // now the ands are push into `ands` array, this is the time to concat it.
        var ctx = {}
        var expections = givens.concat(whens, invariants, fn, ands)
              .map(function(fn) { return fn.bind(ctx) })
              .map(function(fn) {
                if (fn.length !== 0) return fn
                return async.asyncify(fn)
              })
        async.series(expections, done)
      })
      test.file = file
      blockManager.currentSuite().addTest(test)
      blockManager.addThenToCurrent(fn)
    }

    context.Invariant = function() {
      var fn = _.findFirstThatIsFunction(arguments)
      blockManager.addInvariantToCurrent(fn)
    }

    context.And = function() {
      var fn = _.findFirstThatIsFunction(arguments)
      if (!blockManager.hasAnyThen())
        throw new Error('cannot use And without Then')
      blockManager.addAndToCurrent(fn)
    }

    context.Then.skip = context.xit
  })
}
