const expect = require('expect.js');

describe("Cleanup(fn)", () => {

  describe("cleanup is run", () => {

    context('when Then pass', () => {
      var info = [];
      Then(() => 'pass');
      And(() => info.push('A'));
      Cleanup(() => info.push("C"));

      describe("verify", () => {
        Then(() => expect(["A", "C"]).to.eql(info));
      });
    });

    context('when Then fail', () => {
      var info = [];

      ThenFail(() => false);
      And(() => info.push('A'));
      Cleanup(() => info.push("C"));

      describe("verify", () => {
        Then(() => expect(["C"]).to.eql(info));
      });
    });

    context('when other Cleanup fail', () => {
      var info = [];
      ThenFail(() => false);
      Cleanup(() => { throw new Error('oops!'); });
      Cleanup(() => info.push("C"));

      describe("verify", () => {
        Then(() => expect(["C"]).to.eql(info));
      });
    });
  });

  describe("with nested cleanups", () => {
    var info = [];
    Cleanup(() => info.push("C-OUTER"));

    context("inner", () => {
      Then(() => info.push("T-INNER"));
      And(() => info.push("A-INNER"));
      Cleanup(() => info.push("C-INNER"));

      context("verify", () => {
        Then(() => expect(info).to.eql(["T-INNER", "A-INNER", "C-OUTER", "C-INNER"]));
      });
    });
  });
});
