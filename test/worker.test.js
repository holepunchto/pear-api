'use strict'

const { test } = require('brittle')
const path = require('path')

const dirname = __dirname

test.skip('worker pipe', async function ({ is, plan, teardown }) {
  teardown(() => { global.Pear = null })

  plan(1)

  const dir = path.join(dirname, 'fixtures', 'worker')

  class RigAPI {
    static RTI = { checkout: { key: dirname, length: null, fork: null } }
  }
  global.Pear = new RigAPI()

  const Worker = require('../worker')
  class TestWorker extends Worker {
    static RUNTIME = Bare.argv[0]
    static RUNTIME_ARGV = [dir]
  }

  const API = require('..')
  class TestAPI extends API {
    static RTI = RigAPI.RTI
  }

  const noop = () => undefined
  const ipc = { ref: noop, unref: noop }
  const state = {}
  const worker = new TestWorker(ipc)
  global.Pear = new TestAPI(ipc, state, { worker })

  const pipe = worker.run(dir)

  pipe.on('error', (err) => {
    if (err.code === 'ENOTCONN') return
    throw err
  })

  const messages = []
  const response = new Promise((resolve) => {
    pipe.on('data', (data) => {
      messages.push(data.toString())
      if (messages.length === 4) resolve(messages.join(''))
    })
  })

  pipe.write('ping')

  const workerResponse = await response
  is(workerResponse, '0123', 'worker pipe can send and receive data')

  pipe.write('exit')
})
