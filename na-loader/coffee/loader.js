var coffee = require('coffee-script')
var originalCompileFile = coffee._compileFile
var minimatch = require('minimatch')
var convert = require('convert-source-map')
var transformThenStatement = require('../../lib/transform-then')

function naturalAssertionCoffeeLoader (options) {

    var patternStartsWithSlash = (options.pattern.lastIndexOf('/', 0) === 0)
    var separator = patternStartsWithSlash ? '' : '/'
    var pattern = options.cwd + separator + options.pattern

    coffee._compileFile = function (filepath, sourceMap) {
        if (! minimatch(filepath, pattern)) {
            return originalCompileFile(filepath, sourceMap)
        }
        var withMap = originalCompileFile(filepath, true) // enable sourcemaps
        var conv = convert.fromJSON(withMap.v3SourceMap)
        // restore filepath since coffeescript compiler drops it
        conv.setProperty('sources', [filepath])
        withMap.js = transformThenStatement(
            withMap.js,
            filepath
        )
        return sourceMap ? withMap : withMap.js
    }

    coffee.register()
}

module.exports = naturalAssertionCoffeeLoader
