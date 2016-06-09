assert = require 'assert'
expect = require 'expect.js'

describe "GIVEN(var, fn)", ->

  context 'example: Character can be damaged', ->
    Character = (name) ->
      hit_points: 20
      attack: (anemy, n) -> anemy.hit_points -= n

    describe 'sync function', ->
      Given 'attacker', -> Character("Attacker")
      Given 'defender', -> Character("Defender")
      GIVEN 'original_hp', -> @defender.hit_points

      When -> @attacker.attack(@defender, 1)

      Then -> assert.equal @defender.hit_points, @original_hp - 1

    describe 'sync function that return a promise', ->
      Given 'attacker', -> Character("Attacker")
      Given 'defender', -> Character("Defender")
      GIVEN 'original_hp', -> Promise.resolve(@defender.hit_points)

      When -> @attacker.attack(@defender, 1)

      Then -> assert.equal @defender.hit_points, @original_hp - 1

    describe 'async function', ->
      context 'with callback', ->
        Given 'attacker', -> Character("Attacker")
        Given 'defender', -> Character("Defender")
        GIVEN 'original_hp', (done) ->
          setImmediate =>
            done(null, @defender.hit_points)

        When -> @attacker.attack(@defender, 1)

        Then -> assert.equal @defender.hit_points, @original_hp - 1

describe "GIVEN(hash)", ->

  describe 'support function', ->
    GIVEN result: -> 'cool'
    Then -> assert.equal @result, 'cool'

describe 'GIVEN(varname, value) is forbidden', ->

  message = null
  try
    GIVEN x: 1
  catch e
    message = e.message
  Then -> expect(message).to.match /GIVEN.*no function provided/
