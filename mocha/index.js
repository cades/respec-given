var Mocha = require('mocha'),
    Suite = require('mocha/lib/suite'),
    Test  = require('mocha/lib/test'),
    factory = require('../lib/factory')

module.exports = Mocha.interfaces['respec-given'] = function(suite) {
  suite.on('pre-require', function(context, file, mocha) {

    // workaround for https://github.com/mochajs/mocha/issues/2297
    // this occurs in mocha@2.4.5 or above
    suite.isPending = function() { return false }

    var core = factory.createCore({
      firstSuite: suite,
      addSuiteCallback: function(currentSuite, title) {
        var suite = Suite.create(currentSuite, title)
        suite.file = file
        return suite
      },
      addSkippedSuiteCallback: function(currentSuite, title) {
        var suite = Suite.create(currentSuite, title)
        suite.file = file
        suite.pending = true
        return suite
      },
      addTestCallback: function(suite, label, fn) {
        var test = new Test(label, fn)
        test.file = file
        suite.addTest(test)
      }
    })

    // traditional describe/it BDD interface

    context.describe = context.context = core.describe
    context.it = context.specify = core.it
    context.xdescribe = context.xcontext = context.describe.skip = context.context.skip = core.xdescribe

    // rspec/given interface

    context.Given = core.Given
    context.Let = core.Let
    context.When = core.When
    context.GivenI = core.GivenI
    context.LetI = core.LetI
    context.Then = core.Then
    context.Invariant = core.Invariant
    context.And = core.And
    context.Then.skip = context.xit
  })
}
