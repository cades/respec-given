var flag = false

module.exports = {
  enable: function() {
    flag = true
  },
  isEnabled: function() {
    return flag
  }
}
