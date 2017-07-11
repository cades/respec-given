var Observable = require("zen-observable");

describe('Given(fn)', () => {

  describe('should be executed immediately', () => {

    context('set variable to `this`', () => {
      Given(function() { this.a = 1; });
      Then(function() { return this.a === 1; });

      context('nested given', () => {
        Given(function() { this.a++; });
        Then(function() { return this.a === 2; });
      });
    });

    context('set variable to outer scope', () => {
      var a = 1;
      Given(function() {  a++; });
      Then(function() { return a === 2; });
    });

    describe('context should be cleaned up', () => {
      context('set another variable `this.b`', () => {
        Given(function() { return this.b = 1; });
        Then(function() { return this.b === 1; });
      });

      context('`this.b` should not be seem here', () => {
        Then(function() { return this.b === undefined; });
      });
    });

    describe('support async', () => {
      Given(function($, done) {
        setTimeout(function() {
          this.subject = function() { return 'cool' };
          done();
        }.bind(this), 0);
      });
      When('result', function() { return this.subject(); });
      Then(function() { return this.result === 'cool'; });
    });

    describe('support promise', () => {
      Given(function() {
        return Promise.resolve().then(function() {
          this.subject = function() { return 'cool'; };
        }.bind(this));
      });
      When('result', function() { return this.subject(); });
      Then(function() { return this.result === 'cool'; });
    });

    describe('support generator', () => {
      Given(function*() {
        return this.subject = yield Promise.resolve(function() { return 'cool'; });
      });
      When('result', function() { return this.subject(); });
      Then(function() { return this.result === 'cool'; });
    });

    describe('support observable', () => {
      Given(function() {
        return Observable.of('cool').map(function(x) {
          this.subject = function() { return x; };
        }.bind(this));
      });
      When('result', function() { return this.subject(); });
      Then(function() { return this.result === 'cool'; });
    });
  });
});

describe('Given(varname, fn)', () => {

  describe('should be accessible on `this`', () => {
    Given('user', function() { return 'cades'; });
    Then(function() { return this.user === 'cades'; });
  });

  describe('should be lazy', () => {
    Given('x', function() { throw new Error('oops!'); });
    Then(function() { return true; });
  });

  describe('should be executed only once', () => {
    var cnt = 0;
    Given('one', function() {
      cnt++;
      return 1;
    });
    Then(function() { return cnt === 0; });
    And(function() { return this.one; });
    And(function() { return cnt === 1; });
    And(function() { return this.one; });
    And(function() { return cnt === 1; });
  });

  describe('should be able to redefine', () => {
    Given('x', function() { return 1; });
    Given('x', function() { return 2; });
    Then(function() { return this.x === 2; });
  });

  context('when varname is assigned to another variable before first access', () => {
    var getterIsEvaluated = false;
    Given('x', function() { return getterIsEvaluated = true; });
    When(function() { return this.x = 'changed'; });
    When(function() { return this.x; });
    Then(function() { return getterIsEvaluated === false; });
    And(function() { return this.x === 'changed'; });
  });

  describe('if return nothing, var is still set', () => {
    Given('x', function() {});
    Then(function() { return this.x === undefined; });
    And(function() { return 'x' in this; });
  });

  describe('does not support async, but with When we can still write clean test', () => {

    context('subject is a function that consume a node-style callback', () => {
      Given('subject', function() {
        return function(done) {
          setTimeout(function() {
            done(null, 'cool');
          }, 0);
        };
      });
      When('result', function($, cb) { return $.subject(cb); });
      Then(function() { return this.result === 'cool'; });
    });

    context('subject is a promise', () => {
      Given('subject', function() { return Promise.resolve('cool'); });
      When('result', function() { return this.subject; });
      Then(function() { return this.result === 'cool'; });
    });
  });
});

describe('Given(hash)', () => {
  context('with function', () => {
    Given({
      user: () => 'cades',
      pass: () => 'pass',
    });
    Then(function() { return this.user === 'cades'; });
    And(function() { return this.pass === 'pass'; });
  });
});

describe('Given(varname, value) is forbidden', () => {
  var message = null;
  try {
    Given({x: 1});
  } catch (e) {
    message = e.message;
  }
  Then(function() { return null !== message.match(/Given.*no function provided/); });
});
