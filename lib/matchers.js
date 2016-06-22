var u = require('./util')

function Failure() {
  var ctor = u.findFirstThatIsNotStringOrRegexp(arguments)
  var pattern = u.findFirstThatIsStringOrRegexp(arguments)
  return {
    matches: function(err) {
      if (!ctor && !pattern)
        throw new Error('neither a constructor function nor a pattern is provided to Failure()')
      if (ctor && !err instanceof ctor)
        throw new Error('object is not an instsance of' + ctor)
      if (pattern && !err.message.match(pattern))
        throw new Error('error message not match to ' + pattern)
    }
  }
}

module.exports = {
  Failure: Failure
}
