var documentationify = require('./documentationify'),
    tosource = require('tosource'),
    isGeneratorFn = require('is-generator-fn'),
    co = require('co'),
    isObservable = require('is-observable'),
    observableToPromise = require('observable-to-promise'),
    matchers = require('./matchers'),
    createError = require('./create-error')

var u = require('./util'),
    isPlainObject =  u.isPlainObject,
    findFirstThatIsFunction = u.findFirstThatIsFunction,
    findFirstThatIsString = u.findFirstThatIsString,
    findFirstThatIsPlainObject = u.findFirstThatIsPlainObject,
    findFirstThatIsNotStringOrRegexp = u.findFirstThatIsNotStringOrRegexp,
    findFirstThatIsStringOrRegexp = u.findFirstThatIsStringOrRegexp

var isGoodHabitModeEnabled = require('./good-habit-mode/is-enabled'),
    GoodHabitViolationError = require('./good-habit-mode/GoodHabitViolationError')

function createCore(opts, blockManager) {
  var addSuiteCallback = opts.addSuiteCallback,
      addSkippedSuiteCallback = opts.addSkippedSuiteCallback,
      addTestCallback = opts.addTestCallback

  blockManager.enter( opts.rootSuite )

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
    return destructHashFor(keyword, function(assignTo, fn) {
      // Given(fn)
      if (!assignTo) {
        blockManager.addGivenToCurrent(resolveAction(fn))
        return
      }

      // Given(var, fn)
      blockManager.addGivenToCurrent(createLazyVar(assignTo, fn))
    })
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
          evaluated = true
          cache = newVal
        }
      })
    }
  }

  function createImmediateGivenLikeFunction(keyword) {
    return destructHashFor(keyword, function(assignTo, fn) {
      // GivenI(fn)
      if (!assignTo) {
        blockManager.addWhenToCurrent(resolveAction(fn))
        return
      }

      // GivenI(result, fn)
      // GivenI(result, fn(done))
      blockManager.addWhenToCurrent(resolveActionToResult(fn, assignTo, true))
    })
  }

  var When = destructHashFor('When', function(assignTo, fn) {
    // When(fn)
    if (!assignTo) {
      blockManager.addWhenToCurrent(resolveAction(fn))
      return
    }

    // When(result, fn)
    // When(result, fn(done))
    blockManager.addWhenToCurrent(resolveActionToResult(fn, assignTo, false))
  })

  function destructHashFor(keyword, handler) {
    return function destructHashAndRunHandler() {
      // keyword(hash)
      if (isPlainObject(arguments[0])) {
        var hash = arguments[0]
        for (var key in hash)
          checkAndRun(key, hash[key])
        return
      }

      var assignTo = findFirstThatIsString(arguments)
      var fn = findFirstThatIsFunction(arguments)

      checkAndRun(assignTo, fn)

      function checkAndRun(assignTo, fn) {
        if (typeof fn !== 'function') throw new Error(keyword + ': no function provided')
        fn._keyword = keyword
        handler(assignTo, fn)
      }
    }
  }

  function resolveAction(origFn) {
    return function(done) {
      var ctx = this
      var fn = isGeneratorFn(origFn) ? co.wrap(origFn) : origFn

      executeFunction(fn, ctx)
        .then(function(res){ done() })
        .catch(function(err) {
          done(createPreparationError(err, origFn))
        })
    }
  }

  function resolveActionToResult(fn, resultName, reportError) {
    return function(done) {
      var ctx = this
      fn = isGeneratorFn(fn) ? co.wrap(fn) : fn

      function assignResult(result) {
        ctx[resultName] = result
      }

      if (reportError) {
        executeFunction(fn, ctx)
          .then(assignResult)    // non-promise value or resolved promise value will arrive here
          .then(done)
          .catch(function(err) { // thrown Error or rejected Error will arrive here
            done(createPreparationError(err, fn))
          })
      } else {
        executeFunction(fn, ctx)
          .then(assignResult)  // non-promise value or resolved promise value will arrive here
          .catch(assignResult) // thrown Error or rejected Error will arrive here
          .then(done)
      }
    }
  }

  function executeFunction(fn, ctx) {
    return new Promise(function(resolve, reject) {
      if (fn.length > 0) {
        fn.call(ctx, function(err, res) { handler(err, res) })
        return
      }

      try {
        var res = fn.call(ctx)
        handler(null, res)
      } catch (e) {
        handler(e)
      }
      function handler(err, res) {
        var result = isObservable(res) ? observableToPromise(res) : res
        err ? reject(err) : resolve(result)
      }
    })
  }

  function createPreparationError(err, fn) {
    err = errorize(err)
    var keyword = fn._keyword
    var msg = 'Failing expression: ' + documentationify(keyword, fn) +
          '\n\n       Reason: ' + err.message + '\n'
    var newErr = new Error(msg)
    newErr.stack = err.stack
    return newErr
  }

  function errorize(err) {
    return err instanceof Error ? err : new Error(err)
  }

  function Then() {
    var label = findFirstThatIsString(arguments)
    var thenFn = findFirstThatIsFunction(arguments)
    var meta = findFirstThatIsPlainObject(arguments)
    var givens = blockManager.allGivens(),
        whens = blockManager.allWhens(),
        invariants = blockManager.allInvariants(),
        ands = blockManager.currentAnds()  // keep reference at this moment. `ands` is a empty array at this moment
    var finalLabel = label || documentationify('Then', thenFn)
    thenFn._keyword = 'Then'
    thenFn._meta = meta
    var finalFn = function(done) {
      // at this moment, all declaration actions are DONE
      // and the suite stack only contain 1 item: the out-most block.
      // so we can not use blockManager anymore
      // now all And are push into `ands` array, this is the time to concat it.
      var ctx = {}
      var runPreparations = function() {
        return givens.concat(whens).reduce(function(p, fn) {
          return p.then(function() {
            return new Promise(function(resolve, reject) {
              if (fn.length === 0) {
                resolve( fn.call(ctx) )
                return
              }
              fn.call(ctx, function(err, res) { err ? reject(err) : resolve(res) })
            })
          })
        }, Promise.resolve())
      }
      var runExpectations = function() {
        return invariants.concat(thenFn, ands).reduce(function(p, fn) {
          return p.then(function() {
            if (fn.length === 0) {
              var result = fn.call(ctx)
              if (result === false)
                throw fn._meta ? createComprehensiveError(fn) : createSimpleError(fn)
              return result
            }
            if (isGoodHabitModeEnabled())
              throw new GoodHabitViolationError('async ' + fn._keyword + ' is discouraged')
            return new Promise(function(resolve, reject) {
              fn.call(ctx, function(err, res) { err ? reject(err) : resolve(res) })
            })
          })
        }, Promise.resolve())
      }

      runPreparations()
        .then(runExpectations)
        .then(function(res){ done() })
        .catch(done)

      function createComprehensiveError(fn) {
        return createError.comprehensive(fn, finalLabel, ctx, fn._keyword, fn._meta)
      }

      function createSimpleError(fn) {
        return createError.simple(fn, finalLabel, fn._keyword)
      }
    }
    addTestCallback(blockManager.currentSuite(), finalLabel, finalFn)
    blockManager.addThenToCurrent(thenFn)
  }

  function Invariant() {
    var fn = findFirstThatIsFunction(arguments)
    var meta = findFirstThatIsPlainObject(arguments)
    fn._keyword = 'Invariant'
    fn._meta = meta
    blockManager.addInvariantToCurrent(fn)
  }

  function And() {
    var fn = findFirstThatIsFunction(arguments)
    var meta = findFirstThatIsPlainObject(arguments)
    fn._keyword = 'And'
    fn._meta = meta
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
    GivenI: createImmediateGivenLikeFunction('GivenI'),
    LetI: createImmediateGivenLikeFunction('LetI'),
    When: When,
    Then: Then,
    Invariant: Invariant,
    And: And,

    Failure: matchers.Failure
  }
}

module.exports = {
  create: createCore
}
