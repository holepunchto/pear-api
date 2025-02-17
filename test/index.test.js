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

  const runResponse = await response
  t.is(runResponse, '0123', 'pear pipe can send and receive data')

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

  t.is(result, JSON.stringify(args), 'run should receive args from the parent')

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

  t.is(response, 'hello world', 'run should send expected response')

  await Helper.untilClose(pipe)
})

test('run exit when child calls pipe.end()', async function (t) {
  const runParent = path.join(dirname, 'fixtures', 'run-parent')
  const runEndFromChild = path.join(dirname, 'fixtures', 'run-end-from-child')

  const teardown = Helper.rig({ runtimeArgv: [runParent] })
  t.teardown(teardown)

  const pipe = await Pear.run(runParent, [runEndFromChild])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilExit(pid)
})

test('run exit when child calls pipe.destroy()', async function (t) {
  const runParentErrorHandler = path.join(dirname, 'fixtures', 'run-parent-error-handler')
  const runDestroyFromChild = path.join(dirname, 'fixtures', 'run-destroy-from-child')

  const teardown = Helper.rig({ runtimeArgv: [runParentErrorHandler] })
  t.teardown(teardown)

  const pipe = await Pear.run(runParentErrorHandler, [runDestroyFromChild])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilExit(pid)
})

test('run exit when parent calls pipe.end()', async function (t) {
  const runEndFromParent = path.join(dirname, 'fixtures', 'run-end-from-parent')
  const runChild = path.join(dirname, 'fixtures', 'run-child')

  const teardown = Helper.rig({ runtimeArgv: [runEndFromParent] })
  t.teardown(teardown)

  const pipe = await Pear.run(runEndFromParent, [runChild])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilExit(pid)
})

test('run exit when parent calls pipe.destroy()', async function (t) {
  const runDestroyFromParent = path.join(dirname, 'fixtures', 'run-destroy-from-parent')
  const runChildErrorHandler = path.join(dirname, 'fixtures', 'run-child-error-handler')

  const teardown = Helper.rig({ runtimeArgv: [runDestroyFromParent] })
  t.teardown(teardown)

  const pipe = await Pear.run(runDestroyFromParent, [runChildErrorHandler])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilExit(pid)
})
