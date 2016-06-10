var lastStatementInFn = require('./last-statement-in-fn')

module.exports = function(fnAst) {
  return lastStatementInFn(fnAst).argument
}
