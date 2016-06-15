# respec-given

respec-given is an extension to the mocha testing framework. It encourages cleaner, readable, and maintainable specs/tests using `Given`, `When`, and `Then`. It is a shameless tribute to Ludwig Magnusson's [mocha-gwt](https://github.com/TheLudd/mocha-gwt), Robert Fleischmann's [mocha-given](https://github.com/rendro/mocha-given), Justin Searl's [jasmine-given](https://github.com/searls/jasmine-given), James Sadler's [given.js](https://github.com/freshtonic/given.js), Sergii Stotskyi's [bdd-lazy-var](https://github.com/stalniy/bdd-lazy-var), and the origination of all: Jim Weirich's [rspec-given](https://github.com/jimweirich/rspec-given) gem.

If you never heard any project mentioned above, I highly recommend you watching [How to Stop Hating your Test Suite](https://youtu.be/VD51AkG8EZw?t=8m42s) by Justin Searls, which inspired me to start this project.

rspec-given is awesome. While embrace JavaScript's asynchronous nature, respec-given aims to strictly meet rspec-given's spec. Seriously.


## Installation

install `respec-given` locally

    npm install --save-dev respec-given
    
then run mocha with it:

    mocha --ui respec-given --require respec-given/na-loader
    
in case your tests are written in CoffeeScript:

    mocha --ui respec-given --require respec-given/na-loader/coffee

see more about [natural assertion loaders](#transform-test-code)
    

## Demo

[![asciicast](https://asciinema.org/a/48708.png)](https://asciinema.org/a/48708)


## Example

Here is a spec written in respec-given and CoffeeScript. (for JavaScript example, click [here](#lexical-style))

```coffeescript
Stack = require('../stack')

describe 'Stack', ->

  stack_with = (initial_contents) ->
    stack = Object.create Stack
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
    GivenI original_depth: -> @stack.depth()

    context "when pushing", ->
      When -> @stack.push('new_item')

      Then -> @stack.top() == 'new_item'
      Then -> @stack.depth() == @original_depth + 1

    context "when popping", ->
      When pop_result: -> @stack.pop()

      Then -> @pop_result == 'top_item'
      Then -> @stack.top() == 'second_item'
      Then -> @stack.depth() == @original_depth - 1
```

Before we take a closer look at each statement used in respec-given, I hope you can read rspec-given's [documentation](https://github.com/jimweirich/rspec-given#given) first. It explained **the idea behind its design** excellently.

Instead of repeat Jim's words, I'll simply introduce API here.


### Given

`Given` is used to setup precondition. There are 2 types of Given: lazy Given and immediate Given.

#### Lazy Given

```js
    // Given("varname", fn)
    Given('stack', function() { return stack_with([]) })
```

`this.stack` become accessible in other clauses.

The function will be evaluated until first access to `this.stack`. Once the function is evaluated, the result is cached.

If you have multiple `Given`s, like

```js
    Given('stack1', function() { return stack_with([1, 2]) })
    Given('stack2', function() { return stack_with([3, 4]) })
```

you can use object notation as a shorthand:

```js
    // Given({hash})
    Given({
      stack1: function() { return stack_with([1, 2]) },
      stack2: function() { return stack_with([3, 4]) }
    })
```

#### Immediate Given


```js
    // Given(fn)
    var stack
    Given(function() { stack = stack_with([]) })
```

  Using this form, the function will be evaluated **immediately**.


```js
    // GivenI("varname", fn)
    GivenI('stack', function() { return stack_with([]) })
```

  Using this form, the function will be evaluated **immediately** and the return value is assigned to `this.stack`.

#### Let statement

rspec has [`let`](http://www.relishapp.com/rspec/rspec-core/v/3-4/docs/helper-methods/let-and-let) helper, which is a lazy variable declaration. In rspec, `Given` is simply alias to `let`. (Jim mentioned a [reason](https://github.com/jimweirich/rspec-given/wiki/Using-let-and-given-together) why we need `let` if we have `Given` already.)

Since ES6 introduce `let` keyword, to avoid name collision, respec-given choose capitalized `Let`.

- `Let` is an alias to `Given`, which maps to rspec-given's `let/Given`
- `LetI` is an alias to `GivenI`, which maps to rspec-given's `let!/Given!`


### When

`When` is used to perform action and capture result (or Error). All asynchronous operation should be performed here.

```js
    // When(fn)
    When(function() { stack.pop() })
```

  this function will be executed immediately.

```js
    When(function() { return new Promise(...) })
```

  If the function returns a Promise, next statement will be executed until the promise is resolved.

```js
    // When(fn(done))
    When(function(done) {
      asyncOp(function(err, res) {
        done(err, res)
      })
    })
```

  Using this form, you can perform an asynchronous operation. When finished, you should call `done()` is success, or `done(err)` if the operation failed.

```js
    // When("result", fn)
    When('pop_result', function() { return this.stack.pop() })
    Then(function() { this.pop_result === 'top_item' })
```

  Using this form, the function will be executed immediately and the return value is assigned to `this.pop_result`.

```js
    When('result1', function() { return Promise.resolve(1) })
    When('result2', function() { return Promise.reject(2) })
    Then(function() { this.result1 === 1 })
    Then(function() { this.result2 === 2 })
```

  If the function return a Promise, the promise will be resolved to a value (or an error) first, then assign the resolved value to `this.result`.
  
```js
    When('result', function() { throw new Error('oops!') })
    Then(function() { this.result.message === 'oops' })
```

  If the function throws an error synchronously, the error will be caught and assigned to `this.result`.

```js
    // When("result", fn(done))
    When('result', function(done) {
      asyncOp(function(err, res) {
        done(err, res)
      })
    })
```

  Using this form, you can perform asynchronous operation here, while finished you should call `done(res)`, or `done(null, res)` if you prefer Node.js convention. Call `done(err)` if the operation failed. Whatever value you fill into the callback, it will be assigned to `this.result`.
  
  If the function throws an error **synchronously**, the error will be caught and assigned to `this.result`.

If you have multiple `When`s, like

```js
    When('result1', function() { return stack1.pop() })
    When('result2', function() { return stack2.pop() })
```

you can use object notation as a shorthand:

```js
    // When({hash})
    When({
      result1: function() { return stack1.pop() }),
      result2: function() { return stack2.pop() })
    })
```

### Then

A *Then* clause forms a mocha test case of a test suite, it is like `it` in classical BDD style mocha test. But *Then* should only contain an assertion expression, and should not have any side effects.

Let me quote [Jim's words](https://github.com/jimweirich/rspec-given#then) here:

> Let me repeat that: **Then clauses should not have any side effects!** Then clauses with side effects are erroneous. Then clauses need to be idempotent, so that running them once, twice, a hundred times, or never does not change the state of the program. (The same is true of And and Invariant clauses).

OK, let's see some example!

```js
    // Then(fn)
    Then(function() { expect(this.result).to.be(1) })
```

This form uses a 3rd-party assertion/matcher library, for example, chai.js.

```js
    Then(function() { return this.result === 1 })
```

This form returns a boolean expression, this is called [*natural assertion*](#natural-assertion). if the function returns a **boolean false**, this test is considered fail.

```js
    Then(function(done) {
      asyncVerification(function(err, res) {
        done(err, res)
      })
    })
```

*Then* clause supports asynchronous operation, but **this style is discouraged** for 3 reasons:

1. it makes report hard to read
2. natural assertion can not handle this case
3. all asynchronous operation should be done in *When* clause


### And

please refer to [rspec-given's documentation](https://github.com/jimweirich/rspec-given#and)


### Invariant

please refer to [rspec-given's documentation](https://github.com/jimweirich/rspec-given#invariant)


## Execution Ordering

please refer to [rspec-given's documentation](https://github.com/jimweirich/rspec-given#execution-ordering)


## <a name="natural-assertion"></a> Natural Assertions

respec-given supports "natural assertions" in *Then*, *And*, and *Invariant* blocks. Natural assertions are just boolean expressions, without additional assertion library.

### Failure Messages with Natural Assertions

There are 2 kind of failure message, depends on whether test code is transformed.

If the test code is not transformed, simple failure message applies. Otherwise, comprehensive failure message applies. The former simply points out which expression failed, the later show each subexpression's value, which is easier for developers to debug.

#### Simple Failure Message

example:

```
     Error: Then { this.stack.depth() === 0 }

       Invariant expression failed.
       Failing expression: Invariant { this.stack.empty() === (this.stack.depth() === 0) }

```

#### Comprehensive Failure Message

example:

```
  Error: Then { this.stack.depth() === 0 }

         Invariant expression failed at test/stack_spec.coffee:23:13
         Failing expression: Invariant { this.stack.empty() === (this.stack.depth() === 0) }
         expected: false
         to equal: true
           false       <- this.stack.empty() === (this.stack.depth() === 0)
           false       <- this.stack.empty()
           #function#  <- this.stack.empty
           Object{_arr:[]}
                       <- this.stack
           true        <- this.stack.depth() === 0
           0           <- this.stack.depth()
           #function#  <- this.stack.depth
           Object{_arr:[]}
                       <- this.stack
```

### <a name="transform-test-code"></a> Transform test code

The technique used here is inspired by [power-assert](https://github.com/power-assert-js/power-assert).

there are 2 Node.js loader out of the box:

- JavaScript loader

    mocha --ui respec-given --require respec-given/na-loader
    
- CoffeeScript loader

    mocha --ui respec-given --require respec-given/na-loader/coffee

