const dirname = __dirname

class Helper {
  static rig () {
    class TestAPI {
      static RTI = { checkout: { key: dirname, length: null, fork: null } }
      static get CONSTANTS () { return require('../constants') }
      config = {}
    }
    global.Pear = new TestAPI()
  }

  static rigBareWorker () {
    const Worker = require('../worker')
    Worker.RUNTIME = Bare.argv[0]
    Worker.RUNTIME_PARSER = command('bare', ...rundef)
    Worker.RUNTIME_ARGS = []
    const worker = new Worker({ ref: () => undefined, unref: () => undefined })
    return worker
  }

  static rigBareAPI () {
    const ipc = {
      ref: () => undefined,
      unref: () => undefined
    }
    const state = {}
    const worker = Helper.rigBareWorker()
    const API = require('..')
    global.Pear = new API(ipc, state, { worker })
  }
}

module.exports = Helper
