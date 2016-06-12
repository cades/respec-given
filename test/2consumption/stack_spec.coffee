Stack = require('../../lib/stack')

describe 'Stack', ->

  stack_with = (initial_contents) ->
    stack = Object.create Stack
    stack._arr = []
    initial_contents.forEach (item) -> stack.push(item)
    stack

  Given stack: -> stack_with(@initial_contents)
  Invariant -> @stack.empty() == (@stack.depth() == 0)

  context "with no items", ->
    Given initial_contents: -> []
    Then -> @stack.depth() == 0

    context "when pushing", ->
      When -> @stack.push('an_item')

      Then -> @stack.depth() == 1
      Then -> @stack.top() == 'an_item'

  context "with one item", ->
    Given initial_contents: -> ['an_item']

    context "when popping", ->
      When pop_result: -> @stack.pop()

      Then -> @pop_result == 'an_item'
      Then -> @stack.depth() == 0

  context "with several items", ->
    Given initial_contents: -> ['second_item', 'top_item']
    GIVEN original_depth: -> @stack.depth()

    context "when pushing", ->
      When -> @stack.push('new_item')

      Then -> @stack.top() == 'new_item'
      Then -> @stack.depth() == @original_depth + 1

    context "when popping", ->
      When pop_result: -> @stack.pop()

      Then -> @pop_result == 'top_item'
      Then -> @stack.top() == 'second_item'
      Then -> @stack.depth() == @original_depth - 1
