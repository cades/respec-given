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
      Then(function() { return Failure(MyError).matches(this.result); });
    });

    context('with regexp', () => {
      Then(function() { return Failure(/message/).matches(this.result); });
    });

    context('with type and regexp', () => {
      Then(function() { return Failure(MyError, /message/).matches(this.result); });
    });
  });
});
