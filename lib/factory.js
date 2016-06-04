var Stack = require('./stack'),
    SpecManager = require('./spec-manager')

module.exports = {
  createSpecManager: function() {
    var suiteStack = Object.create(Stack)
    suiteStack._arr = []
    var specManager = Object.create(SpecManager)
    specManager._suiteStack = suiteStack
    return specManager
  }
}
