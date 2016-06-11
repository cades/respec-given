describe("requirement for JS testing", function() {

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

})
