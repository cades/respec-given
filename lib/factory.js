var Stack = require('./stack'),
    BlockManager = require('./block-manager'),
    documentationify = require('./documentationify'),
    _ = require('lodash'),
    async = require('async')

module.exports = {

  createBlockManager: function() {
    var blockStack = Object.create(Stack)
    blockStack._arr = []
    var blockManager = Object.create(BlockManager)
    blockManager._blockStack = blockStack
    return blockManager
  },

  createCore: function(opts) {
    var addSuiteCallback = opts.addSuiteCallback,
        addSkippedSuiteCallback = opts.addSkippedSuiteCallback,
        addTestCallback = opts.addTestCallback,
        blockManager = this.createBlockManager()

    blockManager.enter( opts.firstSuite )

    function describe(title, fn) {
      var suite = addSuiteCallback(blockManager.currentSuite(), title)
      blockManager.enter(suite)
      fn.call(suite) // `this` of describe/context (declaration time)
      blockManager.exit()
    }

    function it(title, fn) {
      addTestCallback(blockManager.currentSuite(), title, fn)
    }

    function xdescribe(title, fn) {
      var suite = addSkippedSuiteCallback(blockManager.currentSuite(), title)
      blockManager.enter(suite)
      fn.call(suite)
      blockManager.exit()
    }

    function createGivenLikeFunction(keyword) {
      return function GivenLike() {
        var assignTo = findFirstThatIsString(arguments)
        var fn = findFirstThatIsFunction(arguments)

        // Given(hash)
        if (_.isPlainObject(arguments[0])) {
          var hash = arguments[0]
          for (var key in hash)
            GivenLike(key, hash[key])
          return
        }

        if (typeof fn !== 'function') throw new Error(keyword + ': no function provided')

        // Given(fn)
        if (arguments.length === 1) {
          blockManager.addGivenToCurrent(fn)
          return
        }

        // Given(var, fn)
        blockManager.addGivenToCurrent(createLazyVar(assignTo, fn))
      }
    }

    function createLazyVar(varname, fn) {
      return function() {
        var cache = null
        var evaluated = false
        var ctx = this

        Object.defineProperty(ctx, varname, {
          configurable: true, // allow delete and redefine
          get: function() {
            if (!evaluated) {
              evaluated = true
              return cache = fn.call(ctx)
            }
            return cache
          },
          set: function(newVal) {
            cache = newVal
          }
        })
      }
    }

    function createWhenLikeFunction(keyword) {
      return function WhenLike() {
        var assignTo = findFirstThatIsString(arguments)
        var fn = findFirstThatIsFunction(arguments)

        // When(hash)
        if (_.isPlainObject(arguments[0])) {
          var hash = arguments[0]
          for (var key in hash)
            WhenLike(key, hash[key])
          return
        }

        if (typeof fn !== 'function') throw new Error(keyword + ': no function provided')

        // When(fn)
        if (arguments.length === 0) {
          blockManager.addWhenToCurrent(fn)
          return
        }

        // When(result, fn)
        // When(result, fn(done))
        blockManager.addWhenToCurrent(resolveActionToResult(fn, assignTo))
      }
    }

    function resolveActionToResult(fn, resultName) {
      return function(done) {
        var ctx = this
        function assignResult(result) {
          ctx[resultName] = result
        }

        function executeFunction() {
          if (fn.length === 0) {
            return fn.call(ctx)
          } else {
            return new Promise(function(resolve, reject) {
              fn.call(ctx, function(err, result) {
                if (typeof result !== 'undefined') resolve(result)
                else reject(err)
              })
            })
          }
        }

        Promise.resolve()
          .then(executeFunction)
          .then(assignResult)  // non-promise value or resolved promise value will arrive here
          .catch(assignResult) // thrown Error or rejected Error will arrive here
          .then(done)
      }
    }

    function Then() {
      var label = findFirstThatIsString(arguments)
      var fn = findFirstThatIsFunction(arguments)
      var getters = findFirstThatIsPlainObject(arguments)
      var givens = blockManager.allGivens(),
          whens = blockManager.allWhens(),
          invariants = blockManager.allInvariants(),
          ands = blockManager.currentAnds()  // keep reference at this moment. `ands` is a empty array at this moment

      var finalLabel = label || documentationify(fn)
      var finalFn = function(done) {
        // at this moment, all declaration actions are DONE
        // and the suite stack only contain 1 item: the out-most block.
        // so we can not use blockManager anymore
        // now all And are push into `ands` array, this is the time to concat it.
        var ctx = {}
        var preparations = givens.concat(whens).map(bindContext).map(asyncify)
        var expectations = invariants.concat(fn, ands).map(bindContext).map(asyncify)
        async.series(preparations, function(err) {
          if (err) return done(err)

          var i = 0
          function executeNextExpectation(cb) {
            expectations[i](function(err, res) {
              if (err === null && res === false)
                cb(new Error('failed. ' + finalLabel)) // TODO: add comprehensive message
              else
                cb(err, res)
            })
          }

          function allPass() {
            return ++i === expectations.length
          }

          return async.doUntil(executeNextExpectation, allPass, done)
        })

        function bindContext(fn) { return fn.bind(ctx) }
        function asyncify(fn) { return fn.length !== 0 ? fn : async.asyncify(fn) }
      }
      addTestCallback(blockManager.currentSuite(), finalLabel, finalFn)
      blockManager.addThenToCurrent(fn)
    }

    function Invariant() {
      var fn = findFirstThatIsFunction(arguments)
      blockManager.addInvariantToCurrent(fn)
    }

    function And() {
      var fn = findFirstThatIsFunction(arguments)
      if (!blockManager.hasAnyThen())
        throw new Error('cannot use And without Then')
      blockManager.addAndToCurrent(fn)
    }

    return {
      describe: describe,
      xdescribe: xdescribe,
      it: it,

      Given: createGivenLikeFunction('Given'),
      Let: createGivenLikeFunction('Let'),
      When: createWhenLikeFunction('When'),
      GIVEN: createWhenLikeFunction('GIVEN'),
      LET: createWhenLikeFunction('LET'),
      Then: Then,
      Invariant: Invariant,
      And: And
    }
  }

}

function findFirstThatIsFunction(arr) {
  return _(arr).find(function (x) {
    return _(x).isFunction()
  })
}

function findFirstThatIsString(arr) {
  return _(arr).find(function (x) {
    return _(x).isString()
  })
}

function findFirstThatIsPlainObject(arr) {
  return _(arr).find(function (x) {
    return _(x).isPlainObject()
  })
}
