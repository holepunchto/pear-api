'use strict'

const { test } = require('brittle')
const path = require('path')

const Helper = require('./helper')

const dirname = __dirname

test('pear run pear pipe', async function ({ is, plan }) {
  plan(1)

  const dir = path.join(dirname, 'fixtures', 'run')

  Helper.rig({ runtimeArgv: [dir] })

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
  is(workerResponse, '0123', 'pear pipe can send and receive data')

  pipe.write('exit')
})

test('worker should receive args from the parent', async function ({ is, plan }) {
  plan(1)

  const dir = path.join(dirname, 'fixtures', 'print-args')

  Helper.rig({ runtimeArgv: [dir] })

  const args = ['hello', 'world']
  const pipe = Pear.run(dir, args)

  const result = await Helper.untilResult(pipe)

  is(result, JSON.stringify(args), 'worker should receive args from the parent')

  await Helper.untilClose(pipe)
})

test('worker should run directly in a terminal app', async function ({ is, plan, comment }) {
  plan(1)

  const runDir = path.join(dirname, 'fixtures', 'worker-runner')
  const helloWorldDir = path.join(dirname, 'fixtures', 'hello-world')

  Helper.rig({ runtimeArgv: [runDir] })

  comment('Running worker using worker-runner...')
  const pipe = Pear.run(runDir, [helloWorldDir])

  const response = await Helper.untilResult(pipe)

  is(response, 'hello world', 'worker should send expected response')

  await Helper.untilClose(pipe)
})

// TODO: how to stage to generate a link?
test.skip('worker should run as a link in a terminal app', () => {
})

test('worker exit when child calls pipe.end()', async function () {
  const workerParent = path.join(dirname, 'fixtures', 'worker-parent')
  const workerEndFromChild = path.join(dirname, 'fixtures', 'worker-end-from-child')

  Helper.rig({ runtimeArgv: [workerParent] })

  const pipe = await Pear.run(workerParent, [workerEndFromChild])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilWorkerExit(pid)
})

test('worker exit when child calls pipe.destroy()', async function () {
  const workerParentErrorHandler = path.join(dirname, 'fixtures', 'worker-parent-error-handler')
  const workerDestroyFromChild = path.join(dirname, 'fixtures', 'worker-destroy-from-child')

  Helper.rig({ runtimeArgv: [workerParentErrorHandler] })

  const pipe = await Pear.run(workerParentErrorHandler, [workerDestroyFromChild])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilWorkerExit(pid)
})

test('worker exit when parent calls pipe.end()', async function () {
  const workerEndFromParent = path.join(dirname, 'fixtures', 'worker-end-from-parent')
  const workerChild = path.join(dirname, 'fixtures', 'worker-child')

  Helper.rig({ runtimeArgv: [workerEndFromParent] })

  const pipe = await Pear.run(workerEndFromParent, [workerChild])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilWorkerExit(pid)
})

test('worker exit when parent calls pipe.destroy()', async function () {
  const workerDestroyFromParent = path.join(dirname, 'fixtures', 'worker-destroy-from-parent')
  const workerChildErrorHandler = path.join(dirname, 'fixtures', 'worker-child-error-handler')

  Helper.rig({ runtimeArgv: [workerDestroyFromParent] })

  const pipe = await Pear.run(workerDestroyFromParent, [workerChildErrorHandler])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilWorkerExit(pid)
})
