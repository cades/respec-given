## Where To Put Variables: `this` Style V.S. Lexical Style

### `this` style

every test has it's own context object, no pollution, no need to cleanup

fit to coffee / ls since they have @ shorthand

### lexical style

in vanilla JS, a lot of `this` is bad to read, write, and test report, we can use lexical varible instead.

and since we don't use this, we can just use ES6 arrow function.

cons:
1. Given is not lazy. Can not delay initialization
2. context is not clean up automatically after each test

