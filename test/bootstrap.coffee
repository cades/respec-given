assert = require 'assert'

describe 'let me start out first TDD step', ->

  describe "I can use 'describe' to declare a test group", ->
    it "and use 'it' to create a test case", -> true

  describe "rspec/given interface", ->
    Then -> assert.equal 1, 1
