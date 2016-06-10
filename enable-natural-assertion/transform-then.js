var esprima = require('esprima'),
    estraverse = require('estraverse'),
    escodegen = require('escodegen'),
    createGetterAst = require('./create-getter-ast')

module.exports = function(source, filepath) {
  var ast = esprima.parse(source)
  estraverse.traverse(ast, {
    enter: function(node, parent) {
      if (node.type === 'CallExpression' && node.callee.name === 'Then') {
        var getters = [],
            fnAst = node.arguments.find(isFunctionExpression)

        if (!fnAst) return
        if (useAsyncStyle()) return // this should be forbidden

        if (!bodyContainsOnlyOneStatement()) return
        if (!theStatementIsReturnStatement()) return

        estraverse.traverse(returnedExpression(), {
          enter: function(node, parent) {
            if (nodeIsNotAnIdentifier()) return
            if (nodeIsPropertyOfOtherIdentifier()) return
            getters.push(createGetterAst(node.name))

            function nodeIsNotAnIdentifier() { return node.type !== 'Identifier' }
            function nodeIsPropertyOfOtherIdentifier() {
              return parent.type === 'MemberExpression' && node === parent.property
            }
          }
        })

        appendGettersToArgumentList()

        function isFunctionExpression(node) { return node.type.match(/(Arrow)?FunctionExpression/) }
        function useAsyncStyle() { return  fnAst.params.length > 0 }
        function bodyContainsOnlyOneStatement() { return statements().length === 1 }
        function statements() { return fnAst.body.body }
        function theStatementIsReturnStatement() { return firstStatement().type === 'ReturnStatement' }
        function returnedExpression() { return firstStatement().argument }
        function firstStatement() { return statements()[0] }
        function appendGettersToArgumentList() {
          node.arguments.push({
            "type": "ObjectExpression",
            "properties": getters
          })
        }
      }
    }
  })

  return escodegen.generate(ast)
}
