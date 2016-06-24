module.exports = require('./register-interface')(
  require('mocha'),
  require('mocha/lib/suite'),
  require('mocha/lib/test')
)
