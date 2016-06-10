var esprima = require('esprima'),
    escodegen = require('escodegen')

module.exports = function(fn) {
  var fnCode = wrapFunctionToExpressionStatement(fn),
      fnAst = esprima.parse(fnCode).body[0].expression

  var code = escodegen.generate(
    lastStatementIsReturnStatement() ?
      returnedExpression() :
      lastStatement())
  var expectationString = cleanup(code)

  function wrapFunctionToExpressionStatement(fn) { return '(' + fn.toString() + ')'}
  function lastStatementIsReturnStatement() { return lastStatement().type === 'ReturnStatement' }
  function returnedExpression() { return lastStatement().argument }
  function lastStatement() { var arr; return (arr = statements())[arr.length - 1] }
  function statements() { return fnAst.body.body }
  function cleanup(str) {
    var newLineOrSemi = str.includes('\n') ? /\n/g : /;/g
    return str.replace(newLineOrSemi, '')
      .replace(/\s\s+/g, ' ')
  }

  return 'Then ' + expectationString
}
