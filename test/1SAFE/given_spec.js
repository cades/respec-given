var Observable = require("zen-observable");

describe('Given(fn)', () => {

  describe('should be executed immediately', () => {

    context('set variable to `$`', () => {
      Given($ => $.a = 1);
      Then($ => $.a === 1);

      context('nested given', () => {
        Given($ => $.a++);
        Then($ => $.a === 2);
      });
    });

    context('set variable to outer scope', () => {
      var a = 1;
      Given(() =>  a++);
      Then(() => a === 2);
    });

    describe('context should be cleaned up', () => {
      context('set another variable `$.b`', () => {
        Given($ => $.b = 1);
        Then($ => $.b === 1);
      });

      context('`$.b` should not be seem here', () => {
        Then($ => $.b === undefined);
      });
    });

    describe('support async', () => {
      Given(($, done) => {
        setTimeout(() => {
          $.subject = () => 'cool'
          done();
        }, 0);
      });
      When('result', $ => $.subject());
      Then($ => $.result === 'cool');
    });

    describe('support promise', () => {
      Given($ => {
        return Promise.resolve().then(() => {
          $.subject = () => 'cool'
        });
      });
      When('result', $ => $.subject());
      Then($ => $.result === 'cool');
    });

    describe('support generator', () => {
      Given(function*($) {
        return $.subject = yield Promise.resolve(() => 'cool');
      });
      When('result', $ => $.subject());
      Then($ => $.result === 'cool');
    });

    describe('support observable', () => {
      Given($ => {
        return Observable.of('cool').map((x) => {
          $.subject = () => x
        });
      });
      When('result', $ => $.subject());
      Then($ => $.result === 'cool');
    });
  });
});

describe('Given(varname, fn)', () => {

  describe('should be accessible on `$`', () => {
    Given('user', $ => 'cades');
    Then($ => $.user === 'cades');
  });

  describe('should be lazy', () => {
    Given('x', $ => { throw new Error('oops!') });
    Then($ => true);
  });

  describe('should be executed only once', () => {
    var cnt = 0;
    Given('one', () => {
      cnt++;
      return 1;
    });
    Then($ => cnt === 0);
    And($ => $.one);
    And($ => cnt === 1);
    And($ => $.one);
    And($ => cnt === 1);
  });

  describe('should be able to redefine', () => {
    Given('x', () => 1);
    Given('x', () => 2);
    Then($ => $.x === 2);
  });

  context('when varname is assigned to another variable before first access', () => {
    var getterIsEvaluated = false;
    Given('x', () => getterIsEvaluated = true);
    When($ => $.x = 'changed');
    When($ => $.x);
    Then($ => getterIsEvaluated === false);
    And($ => $.x === 'changed');
  });

  describe('if return nothing, var is still set', () => {
    Given('x', $ => {});
    Then($ => $.x === undefined);
    And($ => 'x' in $);
  });

  describe('does not support async, but with When we can still write clean test', () => {

    context('subject is a function that consume a node-style callback', () => {
      Given('subject', $ => {
        return function(done) {
          setTimeout(() => {
            done(null, 'cool');
          }, 0);
        };
      });
      When('result', ($, cb) => $.subject(cb));
      Then($ => $.result === 'cool');
    });

    context('subject is a promise', () => {
      Given('subject', $ => Promise.resolve('cool'));
      When('result', $ => $.subject);
      Then($ => $.result === 'cool');
    });
  });
});

describe('Given(hash)', () => {
  context('with function', () => {
    Given({
      user: () => 'cades',
      pass: () => 'pass',
    });
    Then($ => $.user === 'cades');
    And($ => $.pass === 'pass');
  });
});

describe('Given(varname, value) is forbidden', () => {
  var message = null;
  try {
    Given({x: 1});
  } catch (e) {
    message = e.message;
  }
  Then($ => null !== message.match(/Given.*no function provided/));
});
