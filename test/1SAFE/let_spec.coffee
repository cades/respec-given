describe 'Let(varname, fn)', ->

  describe 'should be accessible on `this`', ->
    Let 'user', -> 'cades'
    Then -> @user == 'cades'

  describe 'should be lazy', ->
    Let 'x', -> throw new Error 'oops!'
    Then -> true

  describe 'should be executed only once', ->
    cnt = 0
    Let 'one', ->
      cnt++          # side effect
      return 1
    Then -> cnt == 0
    And  -> @one     # first access
    And  -> cnt == 1
    And  -> @one     # second access
    And  -> cnt == 1 # still 1, not 2

describe 'Let(varname, value) is forbidden', ->

  message = null
  try
    Let x: 1
  catch e
    message = e.message
  Then -> null != message.match /Let.*no function provided/
