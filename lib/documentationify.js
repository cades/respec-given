var esprima = require('esprima'),
    escodegen = require('escodegen'),
    fnToAst = require('./fn-to-ast'),
    lastStatementInFn = require('./last-statement-in-fn'),
    returnedExpressionInFn = require('./returned-expression-in-fn')

module.exports = function(keyword, fn) {
  var fnAst = fnToAst(fn),
      lastStatement = lastStatementInFn(fnAst),
      returnedExpression = returnedExpressionInFn(fnAst)

  var code = escodegen.generate(
    lastStatementIsReturnStatement() ?
      returnedExpression :
      lastStatement)
  var expectationString = cleanup(code)

  function lastStatementIsReturnStatement() {
    return lastStatement.type === 'ReturnStatement'
  }

  function cleanup(str) {
    var newLineOrSemi = str.includes('\n') ? /\n/g : /;/g
    return str.replace(newLineOrSemi, '')
      .replace(/\s\s+/g, ' ')
  }

  return keyword + ' { ' + expectationString + ' }'
}
