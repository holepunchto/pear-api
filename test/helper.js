const { command } = require('paparam')
const rundef = require('../cmd/run')

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

  static rigWorker () {
    const Worker = require('../worker')
    Worker.RUNTIME = Bare.argv[0]
    Worker.RUNTIME_PARSER = command('bare', ...rundef)
    const worker = new Worker({ ref: () => undefined, unref: () => undefined })
    return worker
  }

  static rigAPI ({ worker, teardown } = {}) {
    const ipc = {
      ref: () => undefined,
      unref: () => undefined
    }
    const state = {}
    const API = require('..')
    global.Pear = new API(ipc, state, { worker, teardown })
  }

  static run (worker, dir, args) {
    worker.constructor.RUNTIME_ARGS = [dir]
    const pipe = worker.run(dir, args)
    return pipe
  }
}

module.exports = Helper
