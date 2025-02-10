'use strict'

const { test } = require('brittle')
const path = require('path')

const dirname = __dirname

const rig = () => {
  class TestAPI {
    static RTI = { checkout: { key: dirname, length: null, fork: null } }
    static get CONSTANTS () { return require('../constants') }
    config = {}
  }
  global.Pear = new TestAPI()
}

test('run pipe', async function ({ is, plan, teardown }) {
  teardown(() => { rig() })
  rig()

  const API = require('..')
  const ipc = {
    ref: () => undefined,
    unref: () => undefined
  }
  const state = {}
  global.Pear = new API(ipc, state, { teardown })

  plan(1)

  const dir = path.join(dirname, 'fixtures', 'worker')
  // TODO: rig to have this.constructor.RUNTIME
  const pipe = Pear.run(dir)

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
