assert = require 'assert'
expect = require 'expect.js'

describe 'Given(fn)', ->
  describe 'should be executed immediately', ->

    context 'set variable to `this`', ->

      Given -> @a = 1
      Then -> assert.equal @a, 1

      context 'nested given', ->
        Given -> @a++
        Then -> assert.equal @a, 2

    context 'set variable to outer scope', ->
      a = 1
      Given -> a++
      Then -> assert.equal a, 2

    describe 'context should be cleaned up', ->
      context 'set another variable `this.b`', ->
        Given -> @b = 1
        Then -> assert.equal @b, 1

      context '`this.b` should not be seem here', ->
        Then -> assert.equal @b, undefined

    describe 'support async', ->
      Given (done) ->
        setImmediate =>
          @subject = -> 'cool'
          done()
      When 'result', -> @subject()
      Then -> assert.equal @result, 'cool'

    describe 'support promise', ->
      Given -> Promise.resolve().then => @subject = -> 'cool'
      When 'result', -> @subject()
      Then -> assert.equal @result, 'cool'

describe 'Given(varname, fn)', ->

  describe 'should be accessible on `this`', ->
    Given 'user', -> 'cades'
    Then -> assert.equal @user, 'cades'

  describe 'should be lazy', ->
    Given 'x', -> throw new Error 'oops!'
    Then -> assert true

  describe 'should be executed only once', ->
    cnt = 0
    Given 'one', ->
      cnt++                # side effect
      return 1
    Then -> # this can be refactor with And statement
      assert.equal cnt,  0
      assert.equal @one, 1 # first access
      assert.equal cnt,  1
      assert.equal @one, 1 # second access
      assert.equal cnt,  1 # still 1, not 2

  describe 'should be able to redefine', ->
    Given 'x', -> 1
    Given 'x', -> 2
    Then -> assert.equal @x, 2

  describe 'if return nothing, var is still set', ->
    Given 'x', -> return
    Then -> assert.equal @x, undefined
    Then -> assert 'x' of @

  describe 'does not support async, but with When we can still write clean test', ->

    context 'subject is a function that consume a node-style callback', ->
      Given 'subject', ->
        (done) =>
          setImmediate =>
            done(null, 'cool')
      When 'result', (cb) -> @subject(cb)
      Then -> assert.equal @result, 'cool'

    context 'subject is a promise', ->
      Given 'subject', -> Promise.resolve 'cool'
      When 'result', -> @subject
      Then -> assert.equal @result, 'cool'

describe 'Given(hash)', ->

  context 'with function', ->
    Given
      user: -> 'cades'
      pass: -> 'pass'
    Then -> assert.equal @user, 'cades'
    Then -> assert.equal @pass, 'pass'

describe 'Given(varname, value) is forbidden', ->

  message = null
  try
    Given x: 1
  catch e
    message = e.message
  Then -> expect(message).to.match /Given.*no function provided/
