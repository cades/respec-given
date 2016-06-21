Observable = require "zen-observable"

describe "GivenI(var, fn)", ->

  context 'example: Character can be damaged', ->
    Character = (name) ->
      hit_points: 20
      attack: (anemy, n) -> anemy.hit_points -= n

    describe 'sync function', ->
      Given 'attacker', -> Character("Attacker")
      Given 'defender', -> Character("Defender")
      GivenI 'original_hp', -> @defender.hit_points

      When -> @attacker.attack(@defender, 1)

      Then -> @defender.hit_points == @original_hp - 1

    describe 'sync function that return a promise', ->
      Given 'attacker', -> Character("Attacker")
      Given 'defender', -> Character("Defender")
      GivenI 'original_hp', -> Promise.resolve(@defender.hit_points)

      When -> @attacker.attack(@defender, 1)

      Then -> @defender.hit_points == @original_hp - 1

    describe 'async function', ->
      context 'with callback', ->
        Given 'attacker', -> Character("Attacker")
        Given 'defender', -> Character("Defender")
        GivenI 'original_hp', (done) ->
          setImmediate =>
            done(null, @defender.hit_points)

        When -> @attacker.attack(@defender, 1)

        Then -> @defender.hit_points == @original_hp - 1

  describe 'support promise', ->
    GivenI -> Promise.resolve().then => @result = 'cool'
    Then -> @result == 'cool'

  describe 'support generator', ->
    Given -> @result = yield Promise.resolve('cool')
    Then -> @result == 'cool'

  describe 'support observable', ->
    Given -> Observable.of('cool').map (x) => @result = x
    Then -> @result == 'cool'

describe "GivenI(hash)", ->

  describe 'support function', ->
    GivenI result: -> 'cool'
    Then -> @result == 'cool'

describe 'GivenI(varname, value) is forbidden', ->

  message = null
  try
    GivenI x: 1
  catch e
    message = e.message
  Then -> null != message.match /GivenI.*no function provided/
