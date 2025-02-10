const dirname = __dirname

class Helper {
  static rig() {
    class TestAPI {
      static RTI = { checkout: { key: dirname, length: null, fork: null } }
      static get CONSTANTS () { return require('../constants') }
      config = {}
    }
    global.Pear = new TestAPI()
  }
}

module.exports = Helper