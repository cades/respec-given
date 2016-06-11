var esprima = require('esprima'),
    escodegen = require('escodegen')

module.exports = {
  fnToAst: fnToAst,
  lastStatementInFn: lastStatementInFn,
  returnedExpressionInFn: returnedExpressionInFn,
  createEvaluatorAst: createEvaluatorAst
}

function fnToAst(fn) {
  var fnCode = wrapFunctionToExpressionStatement(fn),
      fnAst = esprima.parse(fnCode).body[0].expression

  function wrapFunctionToExpressionStatement(fn) {
    return '(' + fn.toString() + ')'
  }

  return fnAst
}

function lastStatementInFn(fnAst) {

  function lastStatement() {
    var arr
    return (arr = statements())[arr.length - 1]
  }

  function statements() {
    return fnAst.body.body
  }

  return lastStatement()
}

function returnedExpressionInFn(fnAst) {
  return lastStatementInFn(fnAst).argument
}

function createEvaluatorAst(node) {
  var expressionCode = escodegen.generate(node),
      objectSource = "({" +
        "source: '" + expressionCode.replace(/'/g, "\\\'") + "', " +
        "nodeType: '" + node.type + "', " +
        "evaluator: function(){ return " + expressionCode + " }})"

  return esprima.parse(objectSource).body[0].expression
}
