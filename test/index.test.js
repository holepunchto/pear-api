'use strict'

const { test } = require('brittle')
const path = require('path')

const Helper = require('./helper')

const dirname = __dirname

test('run pipe', async function ({ is, plan, teardown }) {
  plan(1)

  const dir = path.join(dirname, 'fixtures', 'run')

  const td = Helper.rig({ runtimeArgv: [dir] })
  teardown(td)

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

test('run should receive args from the parent', async function ({ is, plan, teardown }) {
  plan(1)

  const dir = path.join(dirname, 'fixtures', 'print-args')

  const td = Helper.rig({ runtimeArgv: [dir] })
  teardown(td)

  const args = ['hello', 'world']
  const pipe = Pear.run(dir, args)

  const result = await Helper.untilResult(pipe)

  is(result, JSON.stringify(args), 'worker should receive args from the parent')

  await Helper.untilClose(pipe)
})

test('run should run directly in a terminal app', async function ({ is, plan, comment, teardown }) {
  plan(1)

  const runDir = path.join(dirname, 'fixtures', 'worker-runner')
  const helloWorldDir = path.join(dirname, 'fixtures', 'hello-world')

  const td = Helper.rig({ runtimeArgv: [runDir] })
  teardown(td)

  comment('Running worker using worker-runner...')
  const pipe = Pear.run(runDir, [helloWorldDir])

  const response = await Helper.untilResult(pipe)

  is(response, 'hello world', 'worker should send expected response')

  await Helper.untilClose(pipe)
})

// TODO: how to stage to generate a link?
test.skip('worker should run as a link in a terminal app', () => {
})

test('run exit when child calls pipe.end()', async function ({ teardown }) {
  const workerParent = path.join(dirname, 'fixtures', 'worker-parent')
  const workerEndFromChild = path.join(dirname, 'fixtures', 'worker-end-from-child')

  const td = Helper.rig({ runtimeArgv: [workerParent] })
  teardown(td)

  const pipe = await Pear.run(workerParent, [workerEndFromChild])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilWorkerExit(pid)
})

test('run exit when child calls pipe.destroy()', async function ({ teardown }) {
  const workerParentErrorHandler = path.join(dirname, 'fixtures', 'worker-parent-error-handler')
  const workerDestroyFromChild = path.join(dirname, 'fixtures', 'worker-destroy-from-child')

  const td = Helper.rig({ runtimeArgv: [workerParentErrorHandler] })
  teardown(td)

  const pipe = await Pear.run(workerParentErrorHandler, [workerDestroyFromChild])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilWorkerExit(pid)
})

test('run exit when parent calls pipe.end()', async function ({ teardown }) {
  const workerEndFromParent = path.join(dirname, 'fixtures', 'worker-end-from-parent')
  const workerChild = path.join(dirname, 'fixtures', 'worker-child')

  const td = Helper.rig({ runtimeArgv: [workerEndFromParent] })
  teardown(td)

  const pipe = await Pear.run(workerEndFromParent, [workerChild])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilWorkerExit(pid)
})

test('run exit when parent calls pipe.destroy()', async function ({ teardown }) {
  const workerDestroyFromParent = path.join(dirname, 'fixtures', 'worker-destroy-from-parent')
  const workerChildErrorHandler = path.join(dirname, 'fixtures', 'worker-child-error-handler')

  const td = Helper.rig({ runtimeArgv: [workerDestroyFromParent] })
  teardown(td)

  const pipe = await Pear.run(workerDestroyFromParent, [workerChildErrorHandler])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilWorkerExit(pid)
})
