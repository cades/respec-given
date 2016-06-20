expect = require 'expect.js'

describe "And(fn)", ->

  Given 'info', -> []

  describe "And is called after Then", ->
    Then -> @info.push "T"
    And -> @info.push "A"
    And -> expect(["T", "A"]).to.eql @info

  describe "And is called only once with multiple Thens", ->
    Then -> @info.push "T"
    Then -> @info.push "T2"
    And -> expect(@info.toString() == "T" || @info.toString() == "T2")

  describe "Inherited Ands are not run", ->
    Then -> @info.push "T-OUTER"
    And -> @info.push "A-OUTER"
    And -> expect(@info).to.eql ["T-OUTER", "A-OUTER"]

    context "inner", ->
      Then -> @info.push "T-INNER"
      And -> @info.push "A-INNER"
      And -> expect(@info).to.eql ["T-INNER", "A-INNER"]

  describe "Ands require a Then", ->
    message = null
    try
      And ->
    catch e
      message = e.message

    it "defines a message", ->
      expect(message).to.match /and.*without.*then/i
