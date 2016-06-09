expect = require 'expect.js'

describe "Invariants", ->
  Given info: -> []

  Invariant -> @info.push "I1"

  Then -> expect(@info).to.eql ["I1"]

  context "with nested invariants", ->
    Invariant -> @info.push "I2"

    Then -> expect(@info).to.eql ["I1", "I2"]

  context "with multiple invariants", ->
    Invariant -> @info.push "I2a"
    Invariant -> @info.push "I2b"

    Then -> expect(@info).to.eql ["I1", "I2a", "I2b"]

  context "with a when", ->
    Invariant -> @info.push "I2"

    When when_info: -> @info.slice()

    Then -> expect(@info).to.eql ["I1", "I2"]
    Then -> expect(@when_info).to.eql []

