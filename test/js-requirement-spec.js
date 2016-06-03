var expect = require('expect.js')

describe("extra requirement for JS testing", function() {

  context('with ES5 function', function() {
    Then(function(){
      return 1 === 1
    })
  })

  context('with ES6 arrow function', function() {
    Then(() => {
      return 1 === 1
    })
  })

  context('promise support', function() {
    Then(() => {
      return Promise.resolve(1)
    })
  })

  context('async test support', function(){

    Given(function(done) {
      setImmediate(() => {
        this.x = 1
        done()
      })
    })

    Then(function(done) {
      setImmediate(() => {
        expect(this.x).to.be(1)
        done()
      })
    })
  })
})
