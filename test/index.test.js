'use strict'

const { test } = require('brittle')
const path = require('path')
const Helper = require('./helper')
Helper.rig()

const dirname = __dirname

test('run pipe', async function ({ is, plan, teardown }) {
  teardown(() => { global.Pear = undefined })

  const ipc = {
    ref: () => undefined,
    unref: () => undefined
  }
  const state = {}
  const Worker = require('../worker')
  Worker.RUNTIME = Bare.argv[0]
  const worker = new Worker({ ref: () => undefined, unref: () => undefined })
  const API = require('..')
  global.Pear = new API(ipc, state, { worker, teardown })

  plan(1)

  const dir = path.join(dirname, 'fixtures', 'run')
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
