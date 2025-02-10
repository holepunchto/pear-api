'use strict'

const { test } = require('brittle')
const path = require('path')

const constants = require('../constants')

const dirname = __dirname

const setPearMinimal = () => {
  class APIMinimal {
    static RTI = { checkout: { key: dirname, length: null, fork: null } }
    static get CONSTANTS () { return constants }
    config = {}
  }
  global.Pear = new APIMinimal()
}

test('run pipe', async function ({ is, plan, teardown }) {
  teardown(() => { setPearMinimal() })
  setPearMinimal()

  const API = require('..')
  const ipc = {
    ref: () => undefined,
    unref: () => undefined
  }
  const state = {}
  global.Pear = new API(ipc, state, { teardown })

  plan(1)

  const dir = path.join(dirname, 'fixtures', 'worker')
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
