var esprima = require('esprima'),
    escodegen = require('escodegen')

module.exports = function(fn) {
  var fnCode = wrapFunctionToExpressionStatement(fn),
      fnAst = esprima.parse(fnCode).body[0].expression

  function wrapFunctionToExpressionStatement(fn) {
    return '(' + fn.toString() + ')'
  }

  return fnAst
}
