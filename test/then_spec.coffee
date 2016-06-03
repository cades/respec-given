expect = require 'expect.js'

describe "Then(fn)", ->

  context 'with natural assertion', ->
    Then -> 1 == 1

  context 'with assertion library', ->
    Then -> expect(1).to.be(1)

describe 'todos', ->
  Then.skip 'natural assertion return false should fail'
  Then.skip 'non-natural assertion report'

