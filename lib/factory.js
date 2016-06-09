var Stack = require('./stack'),
    BlockManager = require('./block-manager'),
    documentationify = require('./documentationify'),
    _ = require('lodash'),
    async = require('async')

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
      addSuiteCallback(blockManager.currentSuite(), title, function(suite) {
        blockManager.enter(suite)
        fn.call(suite) // `this` of describe/context (declaration time)
        blockManager.exit()
      })
    }

    function it(title, fn) {
      addTestCallback(blockManager.currentSuite(), title, fn)
    }

    function xdescribe(title, fn) {
      addSkippedSuiteCallback(blockManager.currentSuite(), title, function(suite) {
        blockManager.enter(suite)
        fn.call(suite)
        blockManager.exit()
      })
    }

    function createGivenLikeFunction(keyword) {
      return function GivenLike() {
        var assignTo = _.findFirstThatIsString(arguments)
        var fn = _.findFirstThatIsFunction(arguments)

        if (_.isPlainObject(arguments[0])) {              // Given(hash)
          var hash = arguments[0]
          for (var key in hash)
            GivenLike(key, hash[key])
          return
        }

        if (typeof fn !== 'function') throw new Error(keyword + ': no function provided')

        if (arguments.length === 1) {                // Given(fn)
          blockManager.addGivenToCurrent(fn)
          return
        }

        blockManager.addGivenToCurrent(function() {  // Given(var, fn)
          var cache = null
          var evaluated = false
          var ctx = this

          Object.defineProperty(ctx, assignTo, {
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
        })
      }
    }

    function createWhenLikeFunction(keyword) {
      return function WhenLike() {
        var assignTo = _.findFirstThatIsString(arguments)
        var fn = _.findFirstThatIsFunction(arguments)

        if (_.isPlainObject(arguments[0])) { // When(hash)
          var hash = arguments[0]
          for (var key in hash)
            WhenLike(key, hash[key])
          return
        }

        if (typeof fn !== 'function') throw new Error(keyword + ': no function provided')

        if (arguments.length === 0) {   // When(fn)
          blockManager.addWhenToCurrent(fn)
          return
        }

        blockManager.addWhenToCurrent(function(done){
          var ctx = this
          function assignResultAndCallDone(result) {
            ctx[assignTo] = result
            done()
          }

          function executeFunction() {
            if (fn.length === 0) {      // When(result, fn)
              return fn.call(ctx)
            } else {                    // When(result, fn(done))
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
            .then(assignResultAndCallDone)  // non-promise value or resolved promise value will arrive here
            .catch(assignResultAndCallDone) // thrown Error or rejected Error will arrive here
        })
      }
    }

    function Then() {
      var label = _.findFirstThatIsString(arguments)
      var fn = _.findFirstThatIsFunction(arguments)
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
        var expections = givens.concat(whens, invariants, fn, ands)
              .map(function(fn) { return fn.bind(ctx) })
              .map(function(fn) {
                if (fn.length !== 0) return fn
                return async.asyncify(fn)
              })
        async.series(expections, done)
      }
      addTestCallback(blockManager.currentSuite(), finalLabel, finalFn)
      blockManager.addThenToCurrent(fn)
    }

    function Invariant() {
      var fn = _.findFirstThatIsFunction(arguments)
      blockManager.addInvariantToCurrent(fn)
    }

    function And() {
      var fn = _.findFirstThatIsFunction(arguments)
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
