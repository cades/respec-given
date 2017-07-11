const Observable = require("zen-observable");

describe('When(fn)', () => {

  describe('when is not lazy', () => {
    var x = 0;
    When(() => x++);
    Then(() => x === 1);
  });

  describe('support async', () => {
    When(function(done) {
      setTimeout(function() {
        this.result = 'cool';
        done();
      }.bind(this), 0);
    });
    Then(function() { return this.result === 'cool'; });
  });

  describe('support promise (automatically resolve)', () => {
    When(function() {
      return Promise.resolve().then(function() {
        this.result = 'cool';
      }.bind(this));
    });
    Then(function() { return this.result === 'cool'; });
  });

  describe('support generator', () => {
    When(function*() { this.result = yield Promise.resolve('cool'); });
    Then(function() { return this.result === 'cool'; });
  });

  describe('support observable', () => {
    When(function() {
      return Observable.of('cool').map(function(x) {
        this.result = x;
      }.bind(this));
    });
    Then(function() { return this.result === 'cool'; });
  });
});

describe('When(result, fn)', () => {

  describe('promise returned by fn will be automatically resolved', () => {

    context('resolve', () => {
      When('result', () => Promise.resolve('cool'));
      Then(function() { return this.result === 'cool'; });
    });

    context('reject', () => {
      When('result', () => Promise.reject('oops!'));
      Then(function() { return this.result === 'oops!'; });
    });
  });

  describe('support generator', () => {

    context('success', () => {
      When('result', function*() { return yield Promise.resolve('cool'); });
      Then(function() { return this.result === 'cool'; });
    });

    context('error', () => {
      When('result', function*() { return yield Promise.reject('oops!'); });
      Then(function() { return this.result === 'oops!'; });
    });
  });

  describe('support observable', () => {

    context('success', () => {
      When('result', () => Observable.of('cool'));
      Then(function() { return this.result[0] === 'cool'; });
    });

    context('error', () => {
      When('result', () => new Observable((observer) => observer.error('oops!')));
      Then(function() { return this.result === 'oops!'; });
    });
  });

  describe('can capture thrown Error', () => {
    When('result', function() { throw new Error('oops!'); });
    Then(function() { return this.result.message === 'oops!'; });
  });

  describe('if return nothing, var is still set', () => {
    When('result', function() {});
    Then(function() { return this.result === undefined; });
    And(function() { return 'result' in this; });
  });
});

describe('When(result, fn(done))', () => {
  context('async callback', () => {
    When('result', function(done) {
      setTimeout(function() {
        done(null, 'cool');
      }.bind(this), 0);
    });
    Then(function() { return this.result === 'cool'; });
  });

  describe('node-style callback (2nd arg)', () => {
    When('result', (done) => done(null, 'cool'));
    Then(function() { return this.result === 'cool'; });

    describe('can handle falsy value', () => {
      When('false', (cb) => cb(null, false));
      When('zero', (cb) => cb(null, 0));
      When('null', (cb) => cb(null, null));
      When('emptystr', (cb) => cb(null, ""));
      When('NaN', (cb) => cb(null, NaN));
      Then(function() { return this["false"] === false; });
      And(function() { return this.zero === 0; });
      And(function() { return this["null"] === null; });
      And(function() { return this.emptystr === ''; });
      And(function() { return isNaN(this.NaN); });
    });
  });

  describe('raw callback (1st arg)', () => {
    When('result', (done) => done('cool'));
    Then(function() { return this.result === 'cool'; });
  });

  describe('can capture thrown Error', () => {
    When('result', function(done) { throw new Error('oops!'); });
    Then(function() { return this.result.message === 'oops!'; });
  });

  describe('if return nothing, var is still set', () => {
    When('result', (done) => done());
    Then(function() { return this.result === undefined; });
    And(function() { return 'result' in this; });
  });
});

describe('When(result, hash)', () => {
  When({result: () => 'cool'});
  Then(function() { return this.result === 'cool'; });
});

describe('When(result, value) is forbidden', () => {
  var message = null;
  try {
    When({x: 1});
  } catch (e) {
    message = e.message;
  }
  Then(function() { return null !== message.match(/When.*no function provided/); });
});
