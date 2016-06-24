function ExpectationNotMetError(message) {
  this.name = 'ExpectationNotMetError'
  this.message = 'Expect truthy value but got false: ' + message
  this.stack = (new Error()).stack
}

ExpectationNotMetError.prototype = Object.create(Error.prototype)
ExpectationNotMetError.prototype.constructor = ExpectationNotMetError

module.exports = ExpectationNotMetError
