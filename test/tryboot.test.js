'use strict'

const { test } = require('brittle')
const path = require('path')

const Logger = require('../logger')
const Helper = require('./helper')

const dirname = __dirname

test('tryboot default', async function (t) {
  t.plan(5)

  const teardown = Helper.rig({ clearRequireCache: '../tryboot' })
  t.teardown(teardown)

  let resolve = () => {}
  const spawnCalled = new Promise((_resolve) => {
    resolve = _resolve
  })

  const restoreChildProcess = Helper.override('child_process', {
    spawn: (cmd, args, options) => {
      resolve({ cmd, args, options })
      return { unref: () => {} }
    }
  })
  t.teardown(restoreChildProcess)

  const tryboot = require('../tryboot')
  tryboot()

  const res = await spawnCalled

  const constants = require('../constants')
  t.is(res.cmd, constants.RUNTIME, 'spawn called with RUNTIME')
  t.ok(res.args.includes('--sidecar'), 'spawn called with --sidecar')
  t.ok(res.options.detached, 'spawn called with detached')
  t.is(res.options.stdio, 'ignore', 'spawn called with stdio ignore')
  t.is(res.options.cwd, constants.PLATFORM_DIR, 'spawn called with cwd PLATFORM')
})

test('tryboot with --dht-bootstrap flag', async function (t) {
  t.plan(5)

  const dir = path.join(dirname, 'fixtures', 'tryboot')

  const teardown = Helper.rig({ runtimeArgv: [dir], clearRequireCache: '../tryboot' })
  t.teardown(teardown)

  const args = ['--dht-bootstrap', 'bootstrap-value']
  const pipe = Pear.run(dir, args)

  const res = JSON.parse(await Helper.untilResult(pipe))

  t.ok(res.args.includes('--sidecar'), 'spawn called with --sidecar')
  t.ok(res.args.includes('--dht-bootstrap'), 'spawn called with --dht-bootstrap')
  t.ok(res.args.includes('bootstrap-value'), 'spawn called with correct bootstrap value')
  t.ok(res.options.detached, 'spawn called with detached')
  t.is(res.options.stdio, 'ignore', 'spawn called with stdio ignore')

  await Helper.untilClose(pipe)
})

test('tryboot with --log flag', async function (t) {
  t.plan(6)

  const teardown = Helper.rig({ clearRequireCache: '../tryboot' })
  t.teardown(teardown)

  let resolve = () => {}
  const spawnCalled = new Promise((_resolve) => {
    resolve = _resolve
  })
  const restoreChildProcess = Helper.override('child_process', {
    spawn: (cmd, args, options) => {
      resolve({ cmd, args, options })
      return { unref: () => {} }
    }
  })
  t.teardown(restoreChildProcess)

  const restoreCmd = Helper.override('../cmd', () => ({ flags: { log: true } }))
  t.teardown(restoreCmd)

  const tryboot = require('../tryboot')
  tryboot()

  const res = await spawnCalled

  const constants = require('../constants')
  t.is(res.cmd, constants.RUNTIME, 'spawn called with RUNTIME')
  t.ok(res.args.includes('--sidecar'), 'spawn called with --sidecar')
  t.ok(res.args.includes('--log'), 'spawn called with --log')
  t.is(res.options.detached, false, 'spawn called with detached')
  t.is(res.options.stdio, 'inherit', 'spawn called with stdio ignore')
  t.is(res.options.cwd, constants.PLATFORM_DIR, 'spawn called with cwd PLATFORM')
})

test('tryboot with --log-level and --log-fields flags', async function (t) {
  t.plan(6)

  const teardown = Helper.rig({ clearRequireCache: '../tryboot' })
  t.teardown(teardown)

  let resolve = () => {}
  const spawnCalled = new Promise((_resolve) => {
    resolve = _resolve
  })
  const restoreChildProcess = Helper.override('child_process', {
    spawn: (cmd, args, options) => {
      resolve({ cmd, args, options })
      return { unref: () => {} }
    }
  })
  t.teardown(restoreChildProcess)

  const restoreCmd = Helper.override('../cmd', () => ({ flags: { logLevel: Logger.ERR, logFields: 'field1,field2' } }))
  t.teardown(restoreCmd)

  const tryboot = require('../tryboot')
  tryboot()

  const res = await spawnCalled

  const constants = require('../constants')
  t.is(res.cmd, constants.RUNTIME, 'spawn called with RUNTIME')
  t.ok(res.args.includes('--sidecar'), 'spawn called with --sidecar')
  t.ok(res.args.includes('--log-level'), 'spawn called with --log-level')
  t.ok(res.args.includes(Logger.ERR), 'spawn called with correct log-level value')
  t.ok(res.args.includes('--log-fields'), 'spawn called with --log-fields')
  t.ok(res.args.includes('field1,field2'), 'spawn called with correct log-fields value')
})

test('tryboot with --log-labels flag', async function (t) {
  t.plan(6)

  const teardown = Helper.rig({ clearRequireCache: '../tryboot' })
  t.teardown(teardown)

  let resolve = () => {}
  const spawnCalled = new Promise((_resolve) => {
    resolve = _resolve
  })
  const restoreChildProcess = Helper.override('child_process', {
    spawn: (cmd, args, options) => {
      resolve({ cmd, args, options })
      return { unref: () => {} }
    }
  })
  t.teardown(restoreChildProcess)

  const restoreCmd = Helper.override('../cmd', () => ({ flags: { logLabels: 'label1,label2' } }))
  t.teardown(restoreCmd)

  const tryboot = require('../tryboot')
  tryboot()

  const res = await spawnCalled

  const constants = require('../constants')
  t.is(res.cmd, constants.RUNTIME, 'spawn called with RUNTIME')
  t.ok(res.args.includes('--sidecar'), 'spawn called with --sidecar')
  t.ok(res.args.includes('--log-labels'), 'spawn called with --log-labels')
  t.ok(res.args.includes('label1,label2'), 'spawn called with correct log-labels value')
  t.is(res.options.detached, false, 'spawn called with detached')
  t.is(res.options.stdio, 'inherit', 'spawn called with stdio inherit')
})

test('tryboot with --log-stacks flag', async function (t) {
  t.plan(5)

  const teardown = Helper.rig({ clearRequireCache: '../tryboot' })
  t.teardown(teardown)

  let resolve = () => {}
  const spawnCalled = new Promise((_resolve) => {
    resolve = _resolve
  })
  const restoreChildProcess = Helper.override('child_process', {
    spawn: (cmd, args, options) => {
      resolve({ cmd, args, options })
      return { unref: () => {} }
    }
  })
  t.teardown(restoreChildProcess)

  const restoreCmd = Helper.override('../cmd', () => ({ flags: { logStacks: true } }))
  t.teardown(restoreCmd)

  const tryboot = require('../tryboot')
  tryboot()

  const res = await spawnCalled

  const constants = require('../constants')
  t.is(res.cmd, constants.RUNTIME, 'spawn called with RUNTIME')
  t.ok(res.args.includes('--sidecar'), 'spawn called with --sidecar')
  t.ok(res.args.includes('--log-stacks'), 'spawn called with --log-stacks')
  t.ok(res.options.detached, 'spawn called with detached')
  t.is(res.options.stdio, 'ignore', 'spawn called with stdio ignore')
})
