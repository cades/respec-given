var esprima = require('esprima'),
    estraverse = require('estraverse'),
    escodegen = require('escodegen'),
    au = require('../lib/ast-util'),
    createEvaluatorAst = au.createEvaluatorAst

module.exports = function(source, filepath) {
  var ast = esprima.parse(source, { loc: true })
  estraverse.traverse(ast, {
    enter: function(node, parent) {
      var fnAst
      if (node.type !== 'CallExpression') return
      if (!(node.callee.name &&
            node.callee.name.match(/Then|Invariant|And/))) return
      if (!(fnAst = node.arguments.find(isFunctionExpression))) return

      createMetaObjectAsExtraArgument(fnAst, node)

      function isFunctionExpression(node) {
        return node.type.match(/(Arrow)?FunctionExpression/)
      }
    }
  })

  function createMetaObjectAsExtraArgument(fnAst, callAst) {
    var evaluators = []

    if (useAsyncStyle()) return
    if (!bodyContainsOnlyOneStatement()) return
    if (!theStatementIsReturnStatement()) return

    estraverse.traverse(returnedExpression(), {
      enter: function(node, parent) {
        if (nodeIsNotAnExpression() &&
            nodeIsNotAnIdentifier()) return
        if (nodeIsPrimitive()) return
        if (nodeIsPropertyOfOtherIdentifier()) return

        createEvaluatorForExpression(node)

        function nodeIsNotAnExpression() { return !node.type.match(/Expression$/) }
        function nodeIsNotAnIdentifier() { return node.type !== 'Identifier' }
        function nodeIsPrimitive() { return node.name && node.name.match(/undefined|NaN|Infinity/) }
        function nodeIsPropertyOfOtherIdentifier() {
          return parent && parent.type === 'MemberExpression' && node === parent.property
        }
      }
    })

    appendMetaObjectToArgumentList()

    function useAsyncStyle() { return fnAst.params.lbength > 0 }
    function bodyContainsOnlyOneStatement() { return statements().length === 1 }
    function statements() { return fnAst.body.body }
    function theStatementIsReturnStatement() {
      return lastStatement().type === 'ReturnStatement'
    }
    function lastStatement(){ return au.lastStatementInFn(fnAst) }
    function returnedExpression() { return au.returnedExpressionInFn(fnAst) }
    function createEvaluatorForExpression(node) {
      evaluators.push(createEvaluatorAst(node))
    }
    function appendMetaObjectToArgumentList() {
      var isBinaryExpression = returnedExpression().type === 'BinaryExpression',
          metaTmplObj = {
            evaluators: [],
            isBinaryExpression: isBinaryExpression,
            left: function() { return },
            right: function() { return },
            filepath: filepath,
            loc: returnedExpression().loc
          }

      var metaAst = au.objToAst(metaTmplObj)
      metaAst.properties[0].value.elements = evaluators
      if (isBinaryExpression) {
        metaAst.properties[2].value.body.body[0].argument = returnedExpression().left
        metaAst.properties[3].value.body.body[0].argument = returnedExpression().right
      }
      callAst.arguments.push(metaAst)
    }
  }

  return escodegen.generate(ast)
}
