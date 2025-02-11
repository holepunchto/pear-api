'use strict'

const { test } = require('brittle')
const path = require('path')
const { command } = require('paparam')
const Helper = require('./helper')
const rundef = require('../cmd/run')
Helper.rig()

const dirname = __dirname

test('run pipe', async function ({ is, plan, teardown }) {
  teardown(() => { global.Pear = undefined })

  const Worker = require('../worker')
  Worker.RUNTIME = Bare.argv[0]
  Worker.RUNTIME_PARSER = command('bare', ...rundef)
  Worker.RUNTIME_ARGS = []
  const worker = new Worker({ ref: () => undefined, unref: () => undefined })

  plan(1)

  const dir = path.join(dirname, 'fixtures', 'run')
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
