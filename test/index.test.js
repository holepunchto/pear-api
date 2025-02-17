'use strict'

const { test } = require('brittle')
const path = require('path')

const Helper = require('./helper')

const dirname = __dirname

test('run pipe', async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'run')

  const teardown = Helper.rig({ runtimeArgv: [dir] })
  t.teardown(teardown)

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
  t.is(workerResponse, '0123', 'pear pipe can send and receive data')

  pipe.write('exit')
})

test('run should receive args from the parent', async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'print-args')

  const teardown = Helper.rig({ runtimeArgv: [dir] })
  t.teardown(teardown)

  const args = ['hello', 'world']
  const pipe = Pear.run(dir, args)

  const result = await Helper.untilResult(pipe)

  t.is(result, JSON.stringify(args), 'worker should receive args from the parent')

  await Helper.untilClose(pipe)
})

test('run should run directly in a terminal app', async function (t) {
  t.plan(1)

  const runDir = path.join(dirname, 'fixtures', 'run-runner')
  const helloWorldDir = path.join(dirname, 'fixtures', 'hello-world')

  const teardown = Helper.rig({ runtimeArgv: [runDir] })
  t.teardown(teardown)

  const pipe = Pear.run(runDir, [helloWorldDir])

  const response = await Helper.untilResult(pipe)

  t.is(response, 'hello world', 'worker should send expected response')

  await Helper.untilClose(pipe)
})

test('run exit when child calls pipe.end()', async function (t) {
  const workerParent = path.join(dirname, 'fixtures', 'run-parent')
  const workerEndFromChild = path.join(dirname, 'fixtures', 'run-end-from-child')

  const teardown = Helper.rig({ runtimeArgv: [workerParent] })
  t.teardown(teardown)

  const pipe = await Pear.run(workerParent, [workerEndFromChild])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilWorkerExit(pid)
})

test('run exit when child calls pipe.destroy()', async function (t) {
  const workerParentErrorHandler = path.join(dirname, 'fixtures', 'run-parent-error-handler')
  const workerDestroyFromChild = path.join(dirname, 'fixtures', 'run-destroy-from-child')

  const teardown = Helper.rig({ runtimeArgv: [workerParentErrorHandler] })
  t.teardown(teardown)

  const pipe = await Pear.run(workerParentErrorHandler, [workerDestroyFromChild])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilWorkerExit(pid)
})

test('run exit when parent calls pipe.end()', async function (t) {
  const workerEndFromParent = path.join(dirname, 'fixtures', 'run-end-from-parent')
  const workerChild = path.join(dirname, 'fixtures', 'run-child')

  const teardown = Helper.rig({ runtimeArgv: [workerEndFromParent] })
  t.teardown(teardown)

  const pipe = await Pear.run(workerEndFromParent, [workerChild])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilWorkerExit(pid)
})

test('run exit when parent calls pipe.destroy()', async function (t) {
  const workerDestroyFromParent = path.join(dirname, 'fixtures', 'run-destroy-from-parent')
  const workerChildErrorHandler = path.join(dirname, 'fixtures', 'run-child-error-handler')

  const teardown = Helper.rig({ runtimeArgv: [workerDestroyFromParent] })
  t.teardown(teardown)

  const pipe = await Pear.run(workerDestroyFromParent, [workerChildErrorHandler])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilWorkerExit(pid)
})
