var Stack = require('./stack'),
    BlockManager = require('./block-manager'),
    core = require('./core')

module.exports = {

  createCore: function(opts) {
    var blockManager = this.createBlockManager()
    return core.create(opts, blockManager)
  },

  createBlockManager: function() {
    var blockManager = Object.create(BlockManager)
    blockManager._blockStack = this.createStack()
    return blockManager
  },

  createStack: function() {
    var stack = Object.create(Stack)
    stack._arr = []
    return stack
  }
}
