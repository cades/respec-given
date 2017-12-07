<p align="center">
  <img src="https://raw.githubusercontent.com/cades/respec-given/master/doc/logo.png" width="200" height="200" alt="respec-given test framework extension"/>

  [![Build Status](https://travis-ci.org/cades/respec-given.svg?branch=master)](https://travis-ci.org/cades/respec-given)
</p>

# respec-given

respec-given is an extension to the mocha testing framework. It encourages cleaner, readable, and maintainable specs/tests using `Given`, `When`, and `Then`. It is a shameless tribute to Ludwig Magnusson's [mocha-gwt](https://github.com/TheLudd/mocha-gwt), Robert Fleischmann's [mocha-given](https://github.com/rendro/mocha-given), Justin Searl's [jasmine-given](https://github.com/searls/jasmine-given), James Sadler's [given.js](https://github.com/freshtonic/given.js), Sergii Stotskyi's [bdd-lazy-var](https://github.com/stalniy/bdd-lazy-var), and the origination of all: Jim Weirich's [rspec-given](https://github.com/jimweirich/rspec-given) gem.

If you never heard any project mentioned above, I highly recommend you watching [How to Stop Hating your Test Suite](https://youtu.be/VD51AkG8EZw?t=8m42s) by Justin Searls, which inspired me to start this project.

rspec-given is awesome. While embrace JavaScript's asynchronous nature, respec-given aims to strictly meet rspec-given's spec. Seriously.


## Demo

![usage demo](https://raw.githubusercontent.com/cades/respec-given/master/doc/demo.gif)


## Installation

install `respec-given` locally

    npm install --save-dev respec-given

## Usage

### Node.js

with `mocha` command:

    mocha --ui respec-given --require respec-given/na-loader

see more about [natural assertion loaders](#transform-test-code)


### Browser

add script tag after load mocha:

    <script src="node_modules/respec-given/mocha/browser.js"></script>
    <script>mocha.setup('respec-given')</script>

natural assertion transformation tools is not available yet, but you won't wait too long :)

## Example

Here is a spec written in respec-given.

```js
const Stack = require('../stack');

describe('Stack', () => {

  const stack_with = (initial_contents) => {
    var stack = Object.create(Stack);
    initial_contents.forEach(item => stack.push(item))
    return stack;
  };

  Given('stack', $ => stack_with($.initial_contents))
  Invariant($ => $.stack.empty() === ($.stack.depth() === 0))

  context("with no items", () => {
    Given('initial_contents', () => [] )
    Then($ => $.stack.depth() === 0)

    context("when pushing", => {
      When($ => $.stack.push('an_item'))

      Then($ => $.stack.depth() === 1)
      Then($ => $.stack.top() === 'an_item')
    })
  })

  context("with one item", () => {
    Given('initial_contents', () => ['an_item'])

    context("when popping", () => {
      When('pop_result', $ => $.stack.pop())

      Then($ => $.pop_result === 'an_item')
      Then($ => $.stack.depth() === 0)
    })
  })

  context("with several items", () => {
    Given('initial_contents', () => ['second_item', 'top_item'])
    GivenI('original_depth', $ => $.stack.depth())

    context("when pushing", () => {
      When($ => $.stack.push('new_item'))

      Then($ => $.stack.top() === 'new_item')
      Then($ => $.stack.depth() === $.original_depth + 1)
    })

    context("when popping", () => {
      When('pop_result', $ => $.stack.pop())

      Then($ => $.pop_result === 'top_item')
      Then($ => $.stack.top() === 'second_item')
      Then($ => $.stack.depth() === $.original_depth - 1)
    })
  })
```

Before we take a closer look at each statement used in respec-given, I hope you can read rspec-given's [documentation](https://github.com/jimweirich/rspec-given#given) first. It explained **the idea behind its design** excellently.

Instead of repeat Jim's words, I'll simply introduce API here.


### Given

`Given` is used to setup precondition. There are 2 types of Given: lazy Given and immediate Given.

#### Lazy Given

```js
    // Given("varname", fn)
    Given('stack', () => stack_with([]) )
```

`$.stack` become accessible in other clauses.

The function will be evaluated until first access to `$.stack`. Once the function is evaluated, the result is cached.

If you have multiple `Given`s, like

```js
    Given('stack1', () => stack_with([1, 2]) )
    Given('stack2', () => stack_with([3, 4]) )
```

you can use object notation as a shorthand:

```js
    // Given({hash})
    Given({
      stack1: () => stack_with([1, 2]),
      stack2: () => stack_with([3, 4])
    })
```

#### Immediate Given

There are several form of immediate Given. The first category is `Given(fn)`. Since it doesn't specify a variable name, it is for side-effects. The Second category is `GivenI(varname, fn)`. It will evaluate `fn` immediately and assign the returned result to `this.varname`. If error occurs in `fn`, `GivenI` expression will fail.

```js
    // Given(fn)
    Given(($) => stack_with([]) )
```

  Using this form, the function will be evaluated **immediately**.

```js
    Given(() => new Promise(...) )
```

  If the function returns a Promise, next statement will be executed until the promise is resolved.

```js
    Given(() => new Observable(...) )
```

  If the function returns an Observable, next statement will be executed until the observable is complete.

```js
    // Given(fn(done))
    Given(($, done) => {
      asyncOp(done)
    })
```

  Using this form, you can perform an asynchronous operation. When finished, you should call `done()` is success, or `done(err)` if the operation failed.

```js
    // Given(generatorFn)
    Given(function*() { yield yieldable })
```

  generator function is also supported. It will be executed until it returns or throws.

```js
    // GivenI("varname", fn)
    GivenI('stack', () => stack_with([]) )
```

  Using this form, the function will be evaluated **immediately** and the return value is assigned to `$.stack`.

Note unlike lazy-Given, if `fn` returns a Promise or an Observable, it will be resolved/completed automatically.

Also, `fn` can have a callback with signature `(err, res)`, so you can perform asynchronous operation.

`fn` can also be a generator function. the returned value will be assigned to `$.varname`.


#### Let statement

rspec has [`let`](http://www.relishapp.com/rspec/rspec-core/v/3-4/docs/helper-methods/let-and-let) helper, which is a lazy variable declaration. In rspec, `Given` is simply alias to `let`. (Jim mentioned a [reason](https://github.com/jimweirich/rspec-given/wiki/Using-let-and-given-together) why we need `let` if we have `Given` already.)

Since ES6 introduce `let` keyword, to avoid name collision, respec-given choose capitalized `Let`.

- `Let` is an alias to `Given`, which maps to rspec-given's `let/Given`
- `LetI` is an alias to `GivenI`, which maps to rspec-given's `let!/Given!`


### When

`When` is used to perform action and capture result (or Error). All asynchronous operation should be performed here.

```js
    // When(fn)
    When($ => $.stack.pop())
```

  this function will be executed immediately.

```js
    When(() => new Promise(...) )
```

  If the function returns a Promise, next statement will be executed until the promise is resolved.

```js
    When(() => new Observable(...) )
```

  If the function returns an Observable, next statement will be executed until the observable is complete.

```js
    // When(fn($, done))
    When(($, done) => {
      asyncOp(function(err, res) {
        done(err, res)
      })
    })
```

  Using this form, you can perform an asynchronous operation. When finished, you should call `done()` is success, or `done(err)` if the operation failed.

```js
    // When(generatorFn)
    When(function*() { yield yieldable })
```

  generator function is also supported. It will be executed until it returns or throws.

```js
    // When("result", fn)
    When('pop_result', $ => $.stack.pop() )
    Then($ => $.pop_result === 'top_item' )
```

  Using this form, the function will be executed immediately and the return value is assigned to `$.pop_result`.

```js
    When('result1', () => Promise.resolve(1) )
    When('result2', () => Promise.reject(2) )
    Then($ => $.result1 === 1 )
    Then($ => $.result2 === 2 )
```

  If the function return a Promise, the promise will be resolved to a value (or an error) first, then assign the resolved value to `$.result`.
  
```js
    When('result', () => throw new Error('oops!') )
    Then($ => $.result.message === 'oops' )
```

  If the function throws an error synchronously, the error will be caught and assigned to `$.result`.

```js
    // When("result", fn($, done))
    When('result', ($, done) => {
      asyncOp(function(err, res) {
        done(err, res)
      })
    })
```

  Using this form, you can perform asynchronous operation here.
  If operation succeed, you should call `done(null, res)`, and `res` will be assigned to `$.result`.
  If operation failed, you should call `done(err)`, and `err` will be assigned to `$.result`.
  
  If the function throws an error **synchronously**, the error will be caught and assigned to `$.result`.

```js
    // When("result", generatorFn)
    When('result', function*() { return yield yieldable })
```

  generator function is also supported. It will be executed until it returns or throws. The value it returns or throws will be assigned to `$.result`.

If you have multiple `When`s, like

```js
    When('result1', () => stack1.pop() )
    When('result2', () => stack2.pop() )
```

you can use object notation as a shorthand:

```js
    // When({hash})
    When({
      result1: () => stack1.pop() ),
      result2: () => stack2.pop() )
    })
```

### Then

A *Then* clause forms a mocha test case of a test suite, it is like `it` in classical BDD style mocha test. But *Then* should only contain an assertion expression, and should not have any side effects.

Let me quote [Jim's words](https://github.com/jimweirich/rspec-given#then) here:

> Let me repeat that: **Then clauses should not have any side effects!** Then clauses with side effects are erroneous. Then clauses need to be idempotent, so that running them once, twice, a hundred times, or never does not change the state of the program. (The same is true of And and Invariant clauses).

OK, let's see some example!

```js
    // Then(fn)
    Then($ => expect($.result).to.be(1) )
```

This form uses a 3rd-party assertion/matcher library, for example, chai.js.

```js
    Then($ => $.result === 1 )
```

This form returns a boolean expression, this is called [*natural assertion*](#natural-assertion). if the function returns a **boolean false**, this test is considered fail.

```js
    Then(($, done) =>
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


## <a name="natural-assertion"></a>Natural Assertions

respec-given supports "natural assertions" in *Then*, *And*, and *Invariant* blocks. Natural assertions are just boolean expressions, without additional assertion library.

### Failure Messages with Natural Assertions

There are 2 kind of failure message, depends on whether test code is transformed.

If the test code is not transformed, simple failure message applies. Otherwise, comprehensive failure message applies. The former simply points out which expression failed, the later show each subexpression's value, which is easier for developers to debug.

#### Simple Failure Message

example:

```
     Error: Then { $.stack.depth() === 0 }

       Invariant expression failed.
       Failing expression: Invariant { $.stack.empty() === ($.stack.depth() === 0) }

```

#### Comprehensive Failure Message

example:

```
  Error: Then { $.stack.depth() === 0 }

  Invariant expression failed at test/stack_spec.coffee:23:13

         Invariant { $.stack.empty() === ($.stack.depth() === 0) }
                       |     |    |  |      |     |    |  |
                       |     |    |  |      |     |    0  true
                       |     |    |  |      |     #function#
                       |     |    |  false  Object{_arr:[]}
                       |     |    false
                       |     #function#
                       Object{_arr:[]}

         expected: false
         to equal: true
```

### Checking for Errors with Natural Assertions

If you wish to see if the result of a When clause is an Error, you can use the following:

    When('result', () => badAction())
    Then($ => Failure(CustomError, /message/).matches($.result))
    Then($ => Failure(CustomError).matches($.result))
    Then($ => Failure(/message/).matches($.result))


### <a name="transform-test-code"></a>Transform test code

#### What is a *natural assertion loader*?

Natural assertion loader is a tool which analysis test code's `Then` expression, gather context information, and generate code that carries these information. When assertion failed (return false), these information are used to evaluate failed Then clause's subexpression and generate diagnosis message for you.

#### Why tooling?

Because in JavaScript, lexical binding can not be "captured" during execution time. Lexical binding is resolved at lex time, it's the world view of specific block of code. You have no way to share this view to others (in JavaScript). For example:

```js
    var x = 1
    Then(() => x == 0 )
```

`Then` received a function, which returns `false`. Even `Then` can know `x`'s existence by analysis `fn.toString()`, `Then` have no way to access `x`. No.

This is a meta-programming problem, which can not be solved in JavaScript itself. That's why we need a loader (preprocessor, transpiler, instrumenter, whatever you like to call it).

#### When do I need it?

When you use natural assertion, transformed test code would generate more helpful error message for you.

On the other hand, if you are using assertion library (like node.js built-in `assert`, `chai.js`, `expect.js`, or `shouldjs`), which provide their diagnosis message already, then you don't need natural assertion loader.

#### Ok. Tell me how to use it.

there are 3 Node.js loader out of the box:

- JavaScript loader

    ```bash
    mocha --ui respec-given --require respec-given/na-loader
    ```
    
- CoffeeScript loader

    ```bash
    mocha --ui respec-given --require respec-given/na-loader/coffee
    ```

- LiveScript loader

    ```bash
    mocha --ui respec-given --require respec-given/na-loader/ls
    ```

