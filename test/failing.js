describe('these tests should fail', function() {

  describe('throw in Given', function() {
    Given(function() { throw new Error('oops!') })
    Then(function() { return true })
  })

  describe('throw in GivenI', function() {
    GivenI('xx', function() { throw new Error('oops!') })
    Then(function() { return true })
  })

  describe('throw in When', function() {
    When(function() { throw new Error('oops!') })
    Then(function() { return true })
  })

  describe('throw in Given (not Error)', function() {
    Given(function() { throw 'oops!' })
    Then(function() { return true })
  })

  describe('throw in GivenI (not Error)', function() {
    GivenI('xx', function() { throw 'oops!' })
    Then(function() { return true })
  })

  describe('throw in When (not Error)', function() {
    When(function() { throw 'oops!' })
    Then(function() { return true })
  })


})
