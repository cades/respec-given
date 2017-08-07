var MyError;

MyError = function(message) {
  this.name = 'MyError';
  this.message = message;
  return this.stack = (new Error()).stack;
};

MyError.prototype = new Error;

describe('Failure Expression', () => {
  describe('Failure', () => {
    When('result', () => { throw new MyError('message'); });

    context('with type', () => {
      Then($ => Failure(MyError).matches($.result));
    });

    context('with regexp', () => {
      Then($ => Failure(/message/).matches($.result));
    });

    context('with type and regexp', () => {
      Then($ => Failure(MyError, /message/).matches($.result));
    });
  });
});
