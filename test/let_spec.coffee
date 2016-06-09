assert = require 'assert'
expect = require 'expect.js'

describe 'Let(varname, fn)', ->

  describe 'should be accessible on `this`', ->
    Let 'user', -> 'cades'
    Then -> assert.equal @user, 'cades'

  describe 'should be lazy', ->
    Let 'x', -> throw new Error 'oops!'
    Then -> assert true

  describe 'should be executed only once', ->
    cnt = 0
    Let 'one', ->
      cnt++                # side effect
      return 1
    Then -> # this can be refactor with And statement
      assert.equal cnt,  0
      assert.equal @one, 1 # first access
      assert.equal cnt,  1
      assert.equal @one, 1 # second access
      assert.equal cnt,  1 # still 1, not 2

describe 'Let(varname, value) is forbidden', ->

  message = null
  try
    Let x: 1
  catch e
    message = e.message
  Then -> expect(message).to.match /Let.*no function provided/
