const { command } = require('paparam')

const rundef = require('../cmd/run')

const dirname = __dirname

class Helper {
  static rig ({ teardown } = {}) {
    const Worker = require('../worker')
    Worker.RUNTIME = Bare.argv[0]
    Worker.RUNTIME_PARSER = command('bare', ...rundef)
    const worker = new Worker({ ref: () => undefined, unref: () => undefined })

    const ipc = {
      ref: () => undefined,
      unref: () => undefined
    }
    const state = {}
    const API = require('..')
    API.RTI = { checkout: { key: dirname, length: null, fork: null } }

    global.Pear = new API(ipc, state, { worker, teardown })
    return { worker }
  }
}

module.exports = Helper
