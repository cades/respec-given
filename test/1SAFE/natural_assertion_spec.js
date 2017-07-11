describe("Natural Assertion", () => {

  context("success comparison", () => {

    context('with number', () => {
      Then(() =>  1 === 1);
      And(() => 1 === 1);
    });

    context('with string', () => {
      Then(() => "xx" === "xx");
    });

    context('with lexical variable', () => {
      var a = 1;
      Then(() =>  a === 1);
    });

    context('with chain', () => {
      const a = {b: 1};
      const c = 1;
      Then(() => a.b === c);
    });
  });

  context("expression return false", () => {

    context('in Then', () => {
      ThenFail(() =>  1 === 2);
    });

    context('in Invariant', () => {
      Invariant(() => false);
      ThenFail(() => 1);
    });

    context('in And', () => {
      ThenFail(() => 1);
      And(() => false);
    });
  });
});
