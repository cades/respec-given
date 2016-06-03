var parseFunction = require('parse-function')

function notEmpty(s) {
  return s.length > 0
}

function trim(s) {
  return String.prototype.trim.call(s)
}

function chopReturn(s) {
  return s.replace(/return/g, '')
}

function getLastStatement(fnBody) {
  var statements = fnBody.trim()
    .replace(/void 0/g, 'undefined').replace(/\n/g, '').split(';')
    .filter(notEmpty)
    .map(chopReturn)
    .map(trim)
  return statements[statements.length - 1]
}

module.exports = function(fn) {
  var str = fn.toString()
  var meta = parseFunction(str)
  if (meta.name !== 'anonymous')
    return meta.name;
  return 'then ' + getLastStatement(meta.body)
}
