'use strict'
global.Pear = null

const { isWindows } = require('which-runtime')
const IPC = require('pear-ipc')

const dirname = __dirname
const socketPath = isWindows ? '\\\\.\\pipe\\pear-api-test-ipc' : 'test.sock'
const STOP_CHAR = '\n'

const noop = () => undefined

class Helper {
  static rig ({
    ipc = { ref: noop, unref: noop },
    state = {},
    runtimeArgv
  } = {}) {
    if (global.Pear !== null) throw Error(`Prior Pear global not cleaned up: ${global.Pear}`)

    class RigAPI {
      static RTI = { checkout: { key: dirname, length: null, fork: null } }
    }
    global.Pear = new RigAPI()

    const Worker = require('../worker')
    class TestWorker extends Worker {
      static RUNTIME = Bare.argv[0]
      static RUNTIME_ARGV = runtimeArgv
    }

    const API = require('..')
    class TestAPI extends API {
      static RTI = RigAPI.RTI
    }

    const worker = new TestWorker(ipc)
    global.Pear = new TestAPI(ipc, state, { worker })

    return () => {
      global.Pear = null
      // TODO: clear require.cache
    }
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

  static async untilExit (pid, timeout = 5000) {
    if (!pid) throw new Error('Invalid pid')
    const start = Date.now()
    while (await this.isRunning(pid)) {
      if (Date.now() - start > timeout) throw new Error('timed out')
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  static createLazyPromise () {
    let resolve
    const promise = new Promise((_resolve) => { resolve = _resolve })
    return { promise, resolve }
  }

  static async startIpcClient () {
    const client = new IPC.Client({
      socketPath,
      connect: true
    })
    await client.ready()
    return client
  }

  static async startIpcServer ({ handlers, teardown }) {
    const server = new IPC.Server({
      socketPath,
      handlers
    })
    teardown(() => server.close())
    await server.ready()
    return server
  }
}

module.exports = Helper
