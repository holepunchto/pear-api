'use strict'

const dirname = __dirname

class TestAPI {
  static RTI = { checkout: { key: dirname, length: null, fork: null } }
}
global.Pear = new TestAPI()

const API = require('..')
const Worker = require('../worker')

const STOP_CHAR = '\n'

class Helper {
  static rig ({ state = {}, runtimeArgv } = {}) {
    const ipc = {
      ref: () => undefined,
      unref: () => undefined
    }
    API.RTI = { checkout: { key: dirname, length: null, fork: null } }
    Worker.RUNTIME = Bare.argv[0]
    Worker.RUNTIME_ARGV = runtimeArgv
    global.Pear = new API(ipc, state)
  }

  static async untilResult (pipe, opts = {}) {
    const timeout = opts.timeout || 10000
    const res = new Promise((resolve, reject) => {
      let buffer = ''
      const timeoutId = setTimeout(() => reject(new Error('timed out')), timeout)
      pipe.on('data', (data) => {
        buffer += data.toString()
        if (buffer[buffer.length - 1] === STOP_CHAR) {
          clearTimeout(timeoutId)
          resolve(buffer.trim())
        }
      })
      pipe.on('close', () => {
        clearTimeout(timeoutId)
        reject(new Error('unexpected closed'))
      })
      pipe.on('end', () => {
        clearTimeout(timeoutId)
        reject(new Error('unexpected ended'))
      })
    })
    if (opts.runFn) {
      await opts.runFn()
    } else {
      pipe.write('start')
    }
    return res
  }

  static async untilClose (pipe, timeout = 5000) {
    // TODO: fix the "Error: RPC destroyed" when calling pipe.end() too fast, then remove this hack delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const res = new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => reject(new Error('timed out')), timeout)
      pipe.on('close', () => {
        clearTimeout(timeoutId)
        resolve('closed')
      })
      pipe.on('end', () => {
        clearTimeout(timeoutId)
        resolve('ended')
      })
    })
    pipe.end()
    return res
  }

  static async isRunning (pid) {
    try {
      // 0 is a signal that doesn't kill the process, just checks if it's running
      return process.kill(pid, 0)
    } catch (err) {
      return err.code === 'EPERM'
    }
  }

  static async untilWorkerExit (pid, timeout = 5000) {
    if (!pid) throw new Error('Invalid pid')
    const start = Date.now()
    while (await this.isRunning(pid)) {
      if (Date.now() - start > timeout) throw new Error('timed out')
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
}

module.exports = Helper
