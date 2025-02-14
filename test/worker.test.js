'use strict'

const { test } = require('brittle')
const path = require('path')

const Helper = require('./helper')
const Worker = require('../worker')

const dirname = __dirname

test('run pipe', async function ({ is, plan }) {
  plan(1)

  const dir = path.join(dirname, 'fixtures', 'worker')

  Helper.rig({ runtimeArgv: [dir] })

  const worker = new Worker({ ref: () => undefined, unref: () => undefined })

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
