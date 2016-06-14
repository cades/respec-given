var esprima = require('esprima'),
    escodegen = require('escodegen'),
    astUtil = require('./ast-util')

module.exports = function(keyword, fn) {
  var fnAst = astUtil.fnToAst(fn)

  var code = escodegen.generate(
    isArrowFunctionThatImplicitlyReturns() ?
      implicitlyReturnedExpressionInFn() :
      lastStatementIsReturnStatement() ?
      returnedExpression() :
      lastStatement())

  var expectationString = cleanup(code)

  function isArrowFunctionThatImplicitlyReturns() {
    return astUtil.isArrowFunctionThatImplicitlyReturns(fnAst)
  }

  function implicitlyReturnedExpressionInFn() {
    return astUtil.implicitlyReturnedExpressionInFn(fnAst)
  }

  function lastStatementIsReturnStatement() {
    return astUtil.statementIsReturnStatement(lastStatement())
  }

  function returnedExpression() {
    return astUtil.returnedExpressionInFn(fnAst)
  }

  function lastStatement() {
    return astUtil.lastStatementInFn(fnAst)
  }

  function cleanup(str) {
    var newLineOrSemi = str.includes('\n') ? /\n/g : /;/g
    return str.replace(newLineOrSemi, '')
      .replace(/\s\s+/g, ' ')
  }

  return keyword + ' { ' + expectationString + ' }'
}
