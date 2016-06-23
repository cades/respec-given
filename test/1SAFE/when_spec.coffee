Observable = require "zen-observable"

describe 'When(fn)', ->

  describe 'when is not lazy', ->
    x = 0
    When -> x++
    Then -> x == 1

  describe 'support async', ->
    When (done) ->
      setImmediate =>
         @result = 'cool'
         done()
    Then -> @result == 'cool'

  describe 'support promise (automatically resolve)', ->
    When -> Promise.resolve().then => @result = 'cool'
    Then -> @result == 'cool'

  describe 'support generator', ->
    When -> @result = yield Promise.resolve('cool')
    Then -> @result == 'cool'

  describe 'support observable', ->
    When -> Observable.of('cool').map (x) => @result = x
    Then -> @result == 'cool'

  describe 'this form will NOT capture thrown Error', ->
    Then.skip 'I dont know how to test this'

describe 'When(result, fn)', ->

  describe 'promise returned by fn will be automatically resolved', ->

    context 'resolve', ->
      When 'result', -> Promise.resolve 'cool'
      Then -> @result == 'cool'

    context 'reject', ->
      When 'result', -> Promise.reject 'oops!'
      Then -> @result == 'oops!'

  describe 'support generator', ->

    context 'success', ->
      When 'result', -> yield Promise.resolve('cool')
      Then -> @result == 'cool'

    context 'error', ->
      When 'result', -> yield Promise.reject 'oops!'
      Then -> @result == 'oops!'

  describe 'support observable', ->

    context 'success', ->
      When 'result', -> Observable.of('cool')
      Then -> @result[0] == 'cool'

    context 'error', ->
      When 'result', -> new Observable (observer) -> observer.error('oops!')
      Then -> @result == 'oops!'

  describe 'can capture thrown Error', ->
    When 'result', -> throw new Error 'oops!'
    Then -> @result.message == 'oops!'

  describe 'if return nothing, var is still set', ->
    When 'result', -> return
    Then -> @result == undefined
    And -> 'result' of @

describe 'When(result, fn(done))', ->

  context 'async callback', ->
    When 'result', (done) ->
      setImmediate =>
        done(null, 'cool')
    Then -> @result == 'cool'

  describe 'node-style callback (2nd arg)', ->
    When 'result', (done) -> done(null, 'cool')
    Then -> @result == 'cool'

    describe 'can handle falsy value', ->
      When 'false', (cb) -> cb(null, false)
      When 'zero', (cb) -> cb(null, 0)
      When 'null', (cb) -> cb(null, null)
      When 'emptystr', (cb) -> cb(null, "")
      When 'NaN', (cb) -> cb(null, NaN)
      Then -> @false == false
      And -> @zero == 0
      And -> @null == null
      And -> @emptystr == ''
      And -> isNaN @NaN

  describe 'raw callback (1st arg)', ->
    When 'result', (done) -> done('cool')
    Then -> @result == 'cool'

  describe 'can capture thrown Error', ->
    When 'result', (done) -> throw new Error 'oops!'
    Then -> @result.message == 'oops!'

  describe 'if return nothing, var is still set', ->
    When 'result', (done) -> done()
    Then -> @result == undefined
    And -> 'result' of @

describe 'When(result, hash)', ->

  When result: -> 'cool'
  Then -> @result == 'cool'

describe 'When(result, value) is forbidden', ->

  message = null
  try
    When x: 1
  catch e
    message = e.message
  Then -> null != message.match /When.*no function provided/
