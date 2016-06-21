Observable = require "zen-observable"

describe 'Given(fn)', ->
  describe 'should be executed immediately', ->

    context 'set variable to `this`', ->

      Given -> @a = 1
      Then -> @a == 1

      context 'nested given', ->
        Given -> @a++
        Then -> @a == 2

    context 'set variable to outer scope', ->
      a = 1
      Given -> a++
      Then -> a == 2

    describe 'context should be cleaned up', ->
      context 'set another variable `this.b`', ->
        Given -> @b = 1
        Then -> @b == 1

      context '`this.b` should not be seem here', ->
        Then -> @b == undefined

    describe 'support async', ->
      Given (done) ->
        setImmediate =>
          @subject = -> 'cool'
          done()
      When 'result', -> @subject()
      Then -> @result == 'cool'

    describe 'support promise', ->
      Given -> Promise.resolve().then => @subject = -> 'cool'
      When 'result', -> @subject()
      Then -> @result == 'cool'

    describe 'support generator', ->
      Given -> @subject = yield Promise.resolve(-> 'cool')
      When 'result', -> @subject()
      Then -> @result == 'cool'

    describe 'support observable', ->
      Given -> Observable.of('cool').map (x) => @subject = -> x
      When 'result', -> @subject()
      Then -> @result == 'cool'

describe 'Given(varname, fn)', ->

  describe 'should be accessible on `this`', ->
    Given 'user', -> 'cades'
    Then -> @user == 'cades'

  describe 'should be lazy', ->
    Given 'x', -> throw new Error 'oops!'
    Then -> true

  describe 'should be executed only once', ->
    cnt = 0
    Given 'one', ->
      cnt++          # side effect
      return 1
    Then -> cnt == 0
    And  -> @one     # first access
    And  -> cnt == 1
    And  -> @one     # second access
    And  -> cnt == 1 # still 1, not 2

  describe 'should be able to redefine', ->
    Given 'x', -> 1
    Given 'x', -> 2
    Then -> @x == 2

  context 'when varname is assigned to another variable before first access', ->
    getterIsEvaluated = false
    Given 'x', -> getterIsEvaluated = true

    # assign before access
    When -> @x = 'changed'
    When -> @x

    Then -> getterIsEvaluated == false
    And -> @x == 'changed'

  describe 'if return nothing, var is still set', ->
    Given 'x', -> return
    Then -> @x == undefined
    And  -> 'x' of @

  describe 'does not support async, but with When we can still write clean test', ->

    context 'subject is a function that consume a node-style callback', ->
      Given 'subject', ->
        (done) =>
          setImmediate =>
            done(null, 'cool')
      When 'result', (cb) -> @subject(cb)
      Then -> @result == 'cool'

    context 'subject is a promise', ->
      Given 'subject', -> Promise.resolve 'cool'
      When 'result', -> @subject
      Then -> @result == 'cool'

describe 'Given(hash)', ->

  context 'with function', ->
    Given
      user: -> 'cades'
      pass: -> 'pass'
    Then -> @user == 'cades'
    And  -> @pass == 'pass'

describe 'Given(varname, value) is forbidden', ->

  message = null
  try
    Given x: 1
  catch e
    message = e.message
  Then -> null != message.match /Given.*no function provided/
