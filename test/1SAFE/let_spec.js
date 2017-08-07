describe('Let(varname, fn)', () => {

  describe('should be accessible on `this`', () => {
    Let('user', () => 'cades');
    Then($ => $.user === 'cades');
  });

  describe('should be lazy', () => {
    Let('x', () => { throw new Error('oops!'); });
    Then(() => true);
  });

  describe('should be executed only once', () => {
    var cnt;
    cnt = 0;
    Let('one', () => {
      cnt++;
      return 1;
    });
    Then($ => cnt === 0);
    And($ => $.one);
    And($ => cnt === 1);
    And($ => $.one);
    And($ => cnt === 1);
  });
});

describe('Let(varname, value) is forbidden', () => {
  var message = null;
  try {
    Let({x: 1});
  } catch (e) {
    message = e.message;
  }
  Then(() => null !== message.match(/Let.*no function provided/));
});
