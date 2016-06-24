function GoodHabitViolationError(message) {
  this.name = 'GoodHabitViolationError'
  this.message = 'good habit violation: ' + message
  this.stack = (new Error()).stack
}

GoodHabitViolationError.prototype = Object.create(Error.prototype)
GoodHabitViolationError.prototype.constructor = GoodHabitViolationError

module.exports = GoodHabitViolationError
