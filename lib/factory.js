var Stack = require('./stack'),
    BlockManager = require('./block-manager'),
    core = require('./core')

module.exports = {

  createBlockManager: function() {
    var blockStack = Object.create(Stack)
    blockStack._arr = []
    var blockManager = Object.create(BlockManager)
    blockManager._blockStack = blockStack
    return blockManager
  },

  createCore: function(opts) {
    var blockManager = this.createBlockManager()
    return core.create(opts, blockManager)
  }

}
