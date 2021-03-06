var respecGivenCore = require('respec-given-core'),
    patchForVersionInconsistency = require('./patch-for-version-inconsistency')

module.exports = function(Mocha, Suite, Test) {

  return Mocha.interfaces['respec-given'] = function(suite) {
    suite.on('pre-require', function(context, file, mocha) {

      patchForVersionInconsistency(suite)

      var core = respecGivenCore.createCore({
        rootSuite: suite,
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
      context.Cleanup = core.Cleanup
      context.Then.skip = context.xit
      context.Failure = core.Failure

      context.ThenError = core.ThenError
      context.ThenFail = core.ThenFail
    })
  }

}
