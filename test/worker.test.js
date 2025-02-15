'use strict'

const { test } = require('brittle')
const path = require('path')

const Helper = require('./helper')

const dirname = __dirname

test('worker pipe', async function ({ is, plan, teardown }) {
  plan(1)

  const dir = path.join(dirname, 'fixtures', 'worker')

  const td = Helper.rig({ runtimeArgv: [dir] })
  teardown(td)

  const Worker = require('../worker')
  class TestWorker extends Worker {
    static RUNTIME = Bare.argv[0]
    static RUNTIME_ARGV = [dir]
  }
  const worker = new TestWorker()

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
