module.exports = function(fnAst) {

  function lastStatement() {
    var arr
    return (arr = statements())[arr.length - 1]
  }

  function statements() {
    return fnAst.body.body
  }

  return lastStatement()
}
