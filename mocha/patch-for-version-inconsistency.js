var libMochaVersion = require('mocha/package.json').version,
    semver = require('semver'),
    Runnable = require('mocha/lib/runnable'),
    Suite = require('mocha/lib/suite')

// workaround for https://github.com/mochajs/mocha/issues/2297
// see https://github.com/cades/respec-given/issues/2

module.exports = function(rootSuite) {

  if (libMochaVersionIsAtLeast2_4_5() &&
      !runnerMochaVersionIsAtLeast2_4_5()) {
    patchRootSuite()
  }

  if (!libMochaVersionIsAtLeast2_4_5() &&
      runnerMochaVersionIsAtLeast2_4_5()) {
    patchMochaLib()
  }

  function runnerMochaVersionIsAtLeast2_4_5() {
    return !!rootSuite.isPending
  }

  function libMochaVersionIsAtLeast2_4_5() {
    return semver.gte(libMochaVersion, '2.4.5')
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

