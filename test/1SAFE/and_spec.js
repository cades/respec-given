const expect = require('expect.js');

describe("And(fn)", () => {

  Given('info', () => [])

  describe("And is called after Then", () => {
    Then(function() { return this.info.push("T") })
    And(function() { return this.info.push("A") })
    And(function() { expect(["T", "A"]).to.eql(this.info) })
  })

  describe("And is called only once with multiple Thens", () => {
    Then(function() { return this.info.push("T") })
    Then(function() { return this.info.push("T2") })
    And(function(){ expect(this.info.toString() == "T" || this.info.toString() == "T2") })
  })

  describe("Inherited Ands are not run", () => {
    Then(function() { return this.info.push("T-OUTER") })
    And(function() { return this.info.push("A-OUTER") })
    And(function() { expect(this.info).to.eql(["T-OUTER", "A-OUTER"]) })

    context("inner", () => {
      Then(function() { return this.info.push("T-INNER") })
      And(function() { return this.info.push("A-INNER") })
      And(function() { expect(this.info).to.eql(["T-INNER", "A-INNER"]) })
    })
  })

  describe("Ands require a Then", () => {
    var message = null
    try {
      And(function() {})
    } catch (e) {
      message = e.message
    }

    it("defines a message", () => {
      expect(message).to.match(/and.*without.*then/i)
    })
  })
})
