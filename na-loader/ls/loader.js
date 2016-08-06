var LiveScript = require('livescript')
var originalCompile = LiveScript.compile
var minimatch = require('minimatch')
var transformThenStatement = require('../../lib/transform-then')

function naturalAssertionLiveScriptLoader(options) {

  var patternStartsWithSlash = (options.pattern.lastIndexOf('/', 0) === 0)
  var separator = patternStartsWithSlash ? '' : '/'
  var pattern = options.cwd + separator + options.pattern

  LiveScript.compile = function (code, options) {
    if (! minimatch(options.filename, pattern)) {
        return originalCompile(code, options)
    }
    var compiled = originalCompile(code, options)
    var transformedJs = transformThenStatement(
      compiled.code,
      options.filename
    )
    compiled.code = transformedJs
    return compiled
  }
}

module.exports = naturalAssertionLiveScriptLoader
