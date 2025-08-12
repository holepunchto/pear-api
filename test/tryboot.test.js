'use strict'

const { test } = require('brittle')
const path = require('path')
const run = require('pear-run')

const Helper = require('./helper')

const dirname = __dirname

test('tryboot default', async function (t) {
  t.plan(3)

  const teardown = Helper.rig({ clearRequireCache: '../tryboot' })
  t.teardown(teardown)

  let resolve = () => {}
  const spawnCalled = new Promise((_resolve) => {
    resolve = _resolve
  })

  const restoreBareDaemon = Helper.override('bare-daemon', {
    spawn: (cmd, args, options) => {
      resolve({ cmd, args, options })
      return { unref: () => {} }
    }
  })
  t.teardown(restoreBareDaemon)

  const tryboot = require('../tryboot')
  tryboot()

  const res = await spawnCalled

  const constants = require('../constants')
  t.is(res.cmd, constants.RUNTIME, 'spawn called with RUNTIME')
  t.ok(res.args.includes('--sidecar'), 'spawn called with --sidecar')
  t.is(res.options.cwd, constants.PLATFORM_DIR, 'spawn called with cwd PLATFORM')
})

test('tryboot with --dht-bootstrap flag', async function (t) {
  t.plan(3)

  const dir = path.join(dirname, 'fixtures', 'tryboot')

  const teardown = Helper.rig({ clearRequireCache: '../tryboot' })
  t.teardown(teardown)

  const args = ['--dht-bootstrap', 'bootstrap-value']
  const pipe = run(dir, args)

  const res = JSON.parse(await Helper.untilResult(pipe))

  t.ok(res.args.includes('--sidecar'), 'spawn called with --sidecar')
  t.ok(res.args.includes('--dht-bootstrap'), 'spawn called with --dht-bootstrap')
  t.ok(res.args.includes('bootstrap-value'), 'spawn called with correct bootstrap value')

  await Helper.untilClose(pipe)
})
