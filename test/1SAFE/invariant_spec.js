const expect = require('expect.js');

describe("Invariants", () => {
  Given({info: () => []});
  Invariant(function() { return this.info.push("I1"); });
  Then(function() { expect(this.info).to.eql(["I1"]); });

  context("with nested invariants", () => {
    Invariant(function() { return this.info.push("I2"); });
    Then(function() { expect(this.info).to.eql(["I1", "I2"]); });
  });

  context("with multiple invariants", () => {
    Invariant(function() { return this.info.push("I2a"); });
    Invariant(function() { return this.info.push("I2b"); });
    Then(function() { expect(this.info).to.eql(["I1", "I2a", "I2b"]); });
  });

  context("with a when", () => {
    Invariant(function() { return this.info.push("I2"); });
    When({when_info: function() { return this.info.slice(); }});
    Then(function() { expect(this.info).to.eql(["I1", "I2"]); });
    Then(function() { expect(this.when_info).to.eql([]); });
  });
});
