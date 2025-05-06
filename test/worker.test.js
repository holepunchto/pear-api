'use strict'

const { test } = require('brittle')
const { isBare } = require('which-runtime')
const path = require('path')

const dirname = __dirname
global.Pear = null

const rig = ({ runtimeArgv } = {}) => {
  if (global.Pear !== null) throw Error(`Prior Pear global not cleaned up: ${global.Pear}`)

  class RigAPI {
    static RTI = { checkout: { key: dirname, length: null, fork: null } }
  }
  global.Pear = new RigAPI()

  const Worker = require('../worker')
  class TestWorker extends Worker {
    static RUNTIME = isBare ? Bare.argv[0] : process.argv[0]
    static RUNTIME_ARGV = runtimeArgv
  }
  const worker = new TestWorker()

  return {
    teardown: () => { global.Pear = null },
    worker
  }
}

test('worker pipe', async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'worker')

  const { teardown, worker } = rig({ runtimeArgv: [dir] })
  t.teardown(teardown)

  const pipe = worker.run(dir)

  pipe.on('error', (err) => {
    if (err.code === 'ENOTCONN') return // when the other side destroys the pipe
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
  t.is(workerResponse, '0123', 'worker pipe can send and receive data')

  pipe.write('exit')
})
