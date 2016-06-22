var _ = require('lodash')

function findFirstThatIsFunction(arr) {
  return _(arr).find(function (x) {
    return _(x).isFunction()
  })
}

function findFirstThatIsString(arr) {
  return _(arr).find(function (x) {
    return _(x).isString()
  })
}

function findFirstThatIsPlainObject(arr) {
  return _(arr).find(function (x) {
    return _(x).isPlainObject()
  })
}

function findFirstThatIsNotStringOrRegexp(arr) {
  return _(arr).find(function (x) {
    return !_(x).isRegExp() && !_(x).isString()
  })
}

function findFirstThatIsStringOrRegexp(arr) {
  return _(arr).find(function (x) {
    return _(x).isRegExp() || _(x).isString()
  })
}

module.exports = {
  isPlainObject: _.isPlainObject,
  findFirstThatIsFunction: findFirstThatIsFunction,
  findFirstThatIsString: findFirstThatIsString,
  findFirstThatIsPlainObject: findFirstThatIsPlainObject,
  findFirstThatIsNotStringOrRegexp: findFirstThatIsNotStringOrRegexp,
  findFirstThatIsStringOrRegexp: findFirstThatIsStringOrRegexp
}
