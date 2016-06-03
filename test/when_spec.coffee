assert = require 'assert'

describe 'When(fn)', ->

  describe 'should be executed immediately', ->
    Given -> @subject = -> 'cool'
    When -> @result = @subject()
    Then -> assert.equal @result, 'cool'

  describe 'support async', ->
    Given -> @subject = -> 'cool'
    When (done) ->
      setImmediate =>
         @result = @subject()
         done()
    Then -> assert.equal @result, 'cool'

  describe 'support promise (automatically resolve)', ->
    When -> Promise.resolve().then => @result = 'cool'
    Then -> assert.equal @result, 'cool'

describe 'When(result, fn)', ->

  describe 'should be executed immediately', ->
    Given -> @subject = -> 'cool'
    When 'result', -> @subject()
    Then -> assert.equal @result, 'cool'

  describe 'support async', ->
    Given -> @subject = -> 'cool'
    When 'result', (done) ->
      setImmediate =>
        done(null, @subject())
    Then -> assert.equal @result, 'cool'

  describe 'support function that return a promise (automatically resolve)', ->
    When 'result', -> Promise.resolve 'cool'
    Then -> assert.equal @result, 'cool'

describe 'When(result, value)', ->

  describe 'support immediate value', ->
    When 'result', 'cool'
    Then -> assert.equal @result, 'cool'

  describe 'support directly promise (automatically resolve)', ->
    When 'result', Promise.resolve 'cool'
    Then -> assert.equal @result, 'cool'

describe 'When(result, hash)', ->

  describe 'support immediate value', ->
    When result: 'cool'
    Then -> assert.equal @result, 'cool'

  describe 'support directly promise (automatically resolve)', ->
    When result: Promise.resolve 'cool'
    Then -> assert.equal @result, 'cool'

