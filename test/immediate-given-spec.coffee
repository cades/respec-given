assert = require 'assert'
Character = (name) ->
  hit_points: 20
  attack: (anemy, n) ->
    anemy.hit_points -= n

describe "GIVEN(var, value)", ->

  describe 'support immediate value', ->
    GIVEN 'x', 1
    Then -> assert.equal @x, 1

  describe 'support promise', ->
    GIVEN 'x', Promise.resolve 1
    Then -> assert.equal @x, 1

  context 'example: Character can be damaged', ->

    describe 'immediately memorize original hp', ->
      Given 'attacker', -> Character("Attacker")
      Given 'defender', -> Character("Defender")
      GIVEN 'original_hp', -> @defender.hit_points

      When -> @attacker.attack(@defender, 1)

      Then -> assert.equal @defender.hit_points, @original_hp - 1

    describe 'immediate give can handle async operation. wait until I memorize original hp', ->

      context 'with callback', ->
        Given 'attacker', -> Character("Attacker")
        Given 'defender', -> Character("Defender")
        GIVEN 'original_hp', (done) ->
          setImmediate =>
            done(null, @defender.hit_points)

        When -> @attacker.attack(@defender, 1)

        Then -> assert.equal @defender.hit_points, @original_hp - 1

      context 'with Promise', ->
        Given 'attacker', -> Character("Attacker")
        Given 'defender', -> Character("Defender")
        GIVEN 'original_hp', -> Promise.resolve(@defender.hit_points)

        When -> @attacker.attack(@defender, 1)

        Then -> assert.equal @defender.hit_points, @original_hp - 1

describe "GIVEN(hash)", ->

  context 'example: Character can be damaged', ->

    describe 'immediately memorize original hp', ->
      Given 'attacker', -> Character("Attacker")
      Given 'defender', -> Character("Defender")
      GIVEN original_hp: -> @defender.hit_points

      When -> @attacker.attack(@defender, 1)

      Then -> assert.equal @defender.hit_points, @original_hp - 1

    describe 'immediate give can handle async operation. wait until I memorize original hp', ->

      context 'with callback', ->
        Given 'attacker', -> Character("Attacker")
        Given 'defender', -> Character("Defender")
        GIVEN original_hp: (done) ->
          setImmediate =>
            done(null, @defender.hit_points)

        When -> @attacker.attack(@defender, 1)

        Then -> assert.equal @defender.hit_points, @original_hp - 1

      context 'with function that return a Promise', ->
        Given 'attacker', -> Character("Attacker")
        Given 'defender', -> Character("Defender")
        GIVEN original_hp: -> Promise.resolve(@defender.hit_points)

        When -> @attacker.attack(@defender, 1)

        Then -> assert.equal @defender.hit_points, @original_hp - 1
