'use strict'

const { isWindows } = require('which-runtime')
const { test } = require('brittle')
const path = require('path')
const os = require('bare-os')

const Helper = require('./helper')

const dirname = __dirname

test('teardown on pipe end', { skip: isWindows }, async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'run-teardown')

  const teardown = Helper.rig({ runtimeArgv: [dir] })
  t.teardown(teardown)

  const pipe = Pear.run(dir)

  const td = await Helper.untilResult(pipe, { runFn: () => pipe.end() })
  t.is(td, 'teardown', 'teardown executed')
})

test('teardown on os kill', { skip: isWindows }, async function (t) {
  t.plan(2)

  const dir = path.join(dirname, 'fixtures', 'run-teardown-os-kill')

  const teardown = Helper.rig({ runtimeArgv: [dir] })
  t.teardown(teardown)

  const pipe = Pear.run(dir)

  pipe.on('error', (err) => {
    if (err.code === 'ENOTCONN') return
    throw err
  })

  const pid = +(await Helper.untilResult(pipe))
  t.ok(pid > 0, 'worker pid is valid')

  const td = await Helper.untilResult(pipe, { runFn: () => os.kill(pid) })
  t.ok(td, 'teardown executed')
})

test('teardown on os kill with exit code', { skip: isWindows }, async function (t) {
  t.plan(3)

  const dir = path.join(dirname, 'fixtures', 'run-teardown-exit-code')

  const teardown = Helper.rig({ runtimeArgv: [dir] })
  t.teardown(teardown)

  const pipe = Pear.run(dir)

  pipe.on('error', (err) => {
    if (err.code === 'ENOTCONN') return
    throw err
  })

  const pid = +(await Helper.untilResult(pipe))
  t.ok(pid > 0, 'worker pid is valid')

  const exitCodePromise = new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error('timed out')), 5000)
    pipe.on('crash', (data) => {
      clearTimeout(timeoutId)
      resolve(data.exitCode)
    })
  })

  const td = await Helper.untilResult(pipe, { timeout: 5000, runFn: () => os.kill(pid) })
  t.ok(td, 'teardown executed')

  const exitCode = await exitCodePromise
  t.is(exitCode, 124, 'exit code is 124')
})
