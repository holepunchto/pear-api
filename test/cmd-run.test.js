'use strict'

const { test } = require('brittle')
const { command } = require('paparam')
const def = require('../cmd/run')

const run = (argv) => command('run', ...def).parse(argv, { silent: true })

test('cmd/run with dev flag', async function (t) {
  t.plan(1)

  const res = run(['--dev'])

  t.ok(res.flags.dev === true)
})

test('cmd/run with d flag', async function (t) {
  t.plan(1)

  const res = run(['-d'])

  t.ok(res.flags.dev === true)
})

test('cmd/run with devtools flag', async function (t) {
  t.plan(1)

  const res = run(['--devtools'])

  t.ok(res.flags.devtools === true)
})

test('cmd/run with updates-diff flag', async function (t) {
  t.plan(1)

  const res = run(['--updates-diff'])

  t.ok(res.flags.updatesDiff === true)
})

test('cmd/run with no-updates flag', async function (t) {
  t.plan(1)

  const res = run(['--no-updates'])

  t.ok(res.flags.updates === false)
})

test('cmd/run with store flag', async function (t) {
  t.plan(1)

  const res = run(['--store', '/path/to/store'])

  t.ok(res.flags.store === '/path/to/store')
})

test('cmd/run with store flag', async function (t) {
  t.plan(1)

  const res = run(['-s', '/path/to/store'])

  t.ok(res.flags.store === '/path/to/store')
})

test('cmd/run with tmp-store flag', async function (t) {
  t.plan(1)

  const res = run(['--tmp-store'])

  t.ok(res.flags.tmpStore === true)
})

test('cmd/run with t flag', async function (t) {
  t.plan(1)

  const res = run(['-t'])

  t.ok(res.flags.tmpStore === true)
})

test('cmd/run with link flag', async function (t) {
  t.plan(1)

  const res = run(['--link', 'pear://runtime'])

  t.ok(res.flags.link === 'pear://runtime')
})

test('cmd/run with chrome-webrtc-internals flag', async function (t) {
  t.plan(1)

  const res = run(['--chrome-webrtc-internals'])

  t.ok(res.flags.chromeWebrtcInternals === true)
})

test('cmd/run with unsafe-clear-app-storage flag', async function (t) {
  t.plan(1)

  const res = run(['--unsafe-clear-app-storage'])

  t.ok(res.flags.unsafeClearAppStorage === true)
})

test('cmd/run with unsafe-clear-preferences flag', async function (t) {
  t.plan(1)

  const res = run(['--unsafe-clear-preferences'])

  t.ok(res.flags.unsafeClearPreferences === true)
})

test('cmd/run with appling flag', async function (t) {
  t.plan(1)

  const res = run(['--appling', '/path/to/shell'])

  t.ok(res.flags.appling === '/path/to/shell')
})

test('cmd/run with checkout flag', async function (t) {
  t.plan(1)

  const res = run(['--checkout', 'release'])

  t.ok(res.flags.checkout === 'release')
})

test('cmd/run with detached flag', async function (t) {
  t.plan(1)

  const res = run(['--detached'])

  t.ok(res.flags.detached === true)
})

test('cmd/run with no-ask flag', async function (t) {
  t.plan(1)

  const res = run(['--no-ask'])

  t.ok(res.flags.ask === false)
})

test('cmd/run with follow-symlinks flag', async function (t) {
  t.plan(1)

  const res = run(['--follow-symlinks'])

  t.ok(res.flags.followSymlinks === true)
})

test('cmd/run with f flag', async function (t) {
  t.plan(1)

  const res = run(['-f'])

  t.ok(res.flags.followSymlinks === true)
})

test('cmd/run with link arg', async function (t) {
  t.plan(1)

  const res = run(['pear://runtime'])

  t.ok(res.args.link === 'pear://runtime')
})

test('cmd/run with app-args rest', async function (t) {
  t.plan(3)

  const res = run(['pear://runtime', 'val1', 'val2'])

  t.ok(res.args.link === 'pear://runtime')
  t.ok(res.rest[0] === 'val1')
  t.ok(res.rest[1] === 'val2')
})

test('cmd/run with dev and store flags', async function (t) {
  t.plan(2)

  const res = run(['--dev', '--store', '/path/to/store'])

  t.ok(res.flags.dev === true)
  t.ok(res.flags.store === '/path/to/store')
})

test('cmd/run with devtools and tmp-store flags', async function (t) {
  t.plan(2)

  const res = run(['--devtools', '--tmp-store'])

  t.ok(res.flags.devtools === true)
  t.ok(res.flags.tmpStore === true)
})

test('cmd/run with link and chrome-webrtc-internals flags', async function (t) {
  t.plan(2)

  const res = run(['--link', 'pear://runtime', '--chrome-webrtc-internals'])

  t.ok(res.flags.link === 'pear://runtime')
  t.ok(res.flags.chromeWebrtcInternals === true)
})

test('cmd/run with unsafe-clear-app-storage and unsafe-clear-preferences flags', async function (t) {
  t.plan(2)

  const res = run(['--unsafe-clear-app-storage', '--unsafe-clear-preferences'])

  t.ok(res.flags.unsafeClearAppStorage === true)
  t.ok(res.flags.unsafeClearPreferences === true)
})

test('cmd/run with appling and checkout flags', async function (t) {
  t.plan(2)

  const res = run(['--appling', '/path/to/shell', '--checkout', 'release'])

  t.ok(res.flags.appling === '/path/to/shell')
  t.ok(res.flags.checkout === 'release')
})

test('cmd/run with detached and no-ask flags', async function (t) {
  t.plan(2)

  const res = run(['--detached', '--no-ask'])

  t.ok(res.flags.detached === true)
  t.ok(res.flags.ask === false)
})

test('cmd/run with follow-symlinks and link arg', async function (t) {
  t.plan(2)

  const res = run(['--follow-symlinks', 'pear://runtime'])

  t.ok(res.flags.followSymlinks === true)
  t.ok(res.args.link === 'pear://runtime')
})

test('cmd/run with multiple flags and rest args', async function (t) {
  t.plan(5)

  const res = run(['--dev', '--store', '/path/to/store', 'pear://runtime', 'val1', 'val2'])

  t.ok(res.flags.dev === true)
  t.ok(res.flags.store === '/path/to/store')
  t.ok(res.args.link === 'pear://runtime')
  t.ok(res.rest[0] === 'val1')
  t.ok(res.rest[1] === 'val2')
})
