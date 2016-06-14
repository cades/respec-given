var esprima = require('esprima'),
    escodegen = require('escodegen'),
    tosource = require('tosource')

module.exports = {
  fnToAst: fnToAst,
  lastStatementInFn: lastStatementInFn,
  returnedExpressionInFn: returnedExpressionInFn,
  statementIsReturnStatement: statementIsReturnStatement,
  createEvaluatorAst: createEvaluatorAst,
  objToAst: objToAst,
  makeEvaluatorFunction: makeEvaluatorFunction
}

function fnToAst(fn) {
  var fnCode = wrapFunctionToExpressionStatement(fn),
      programAst = esprima.parse(fnCode),
      fnAst = getExpressionFromExpressionStatement(getFirstStatementFromProgram(programAst))

  return fnAst
}

function wrapFunctionToExpressionStatement(fn) {
  return '(' + fn.toString() + ')'
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

function statementIsReturnStatement(stmt) {
  return stmt.type === 'ReturnStatement'
}

function createEvaluatorAst(node) {
  var expressionCode = escodegen.generate(node),
      objTemplate = {
        source: expressionCode.replace(/'/g, "\\\'").replace(/\n/g, ''),
        nodeType: node.type,
        evaluator: null
      },
      objAst = objToAst(objTemplate)

  objAst.properties[2].value = makeEvaluatorFunction(node)

  return objAst
}

function objToAst(obj) {
  var wrappedSource = '(' + tosource(obj) + ')',
      programAst = esprima.parse(wrappedSource),
      objAst = getExpressionFromExpressionStatement(getFirstStatementFromProgram(programAst))

  return objAst
}

function getFirstStatementFromProgram(programAst) {
  return programAst.body[0]
}

function getExpressionFromExpressionStatement(expressionStatementAst) {
  return expressionStatementAst.expression
}

function makeEvaluatorFunction(node) {
  return {
    "type": "FunctionExpression",
    "id": null,
    "params": [],
    "defaults": [],
    "body": {
      "type": "BlockStatement",
      "body": [
        {
          "type": "ReturnStatement",
          "argument": node
        }
      ]
    }
  }
}
