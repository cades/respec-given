var extensions = require.extensions
var originalLoader = extensions['.js']
var fs = require('fs')
var path = require('path')
var minimatch = require('minimatch')
var transformThenStatement = require('../transform-then')

function naturalAssertionJSLoader(options) {

  var patternStartsWithSlash = (options.pattern.lastIndexOf('/', 0) === 0)
  var separator = patternStartsWithSlash ? '' : path.sep
  var pattern = options.cwd + separator + options.pattern

  extensions['.js'] = function(localModule, filepath) {
    if (minimatch(filepath, pattern)) {
      var output = transformThenStatement(fs.readFileSync(filepath, 'utf-8'), filepath)
      localModule._compile(output, filepath)
    } else {
      originalLoader(localModule, filepath)
    }
  }
}

module.exports = naturalAssertionJSLoader
