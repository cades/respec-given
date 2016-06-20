var Runnable = require('mocha/lib/runnable'),
    Suite = require('mocha/lib/suite')

// workaround for https://github.com/mochajs/mocha/issues/2297
// see https://github.com/cades/respec-given/issues/2

module.exports = function(rootSuite) {

  if (mochaLibImplementsIsPending() &&
      !mochaRunnerImplementsIsPending()) {
    patchRootSuite()
  }

  if (!mochaLibImplementsIsPending() &&
      mochaRunnerImplementsIsPending()) {
    patchMochaLib()
  }

  function mochaRunnerImplementsIsPending() {
    return !!rootSuite.isPending
  }

  function mochaLibImplementsIsPending() {
    return !!Suite.prototype.isPending
  }

  function patchRootSuite() {
    patch(rootSuite)
  }

  function patchMochaLib() {
    patch(Runnable.prototype)
    patch(Suite.prototype)
  }

  function patch(target) {
    target.isPending = function() {
      return this.pending || (this.parent && this.parent.isPending())
    }
  }

}

