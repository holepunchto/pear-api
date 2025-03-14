'use strict'

const { test } = require('brittle')
const cmd = require('../cmd')

test('cmd with v flag', async function (t) {
  t.plan(3)

  const res = cmd(['-v'])

  t.ok(res.flags.v === true)
  t.ok(res.args.cmd === undefined)
  t.ok(res.rest === null)
})

test('cmd with log-level flag', async function (t) {
  t.plan(3)

  const res = cmd(['--log-level', '2', 'run', 'pear://runtime'])

  t.ok(res.flags.logLevel === '2')
  t.ok(res.args.cmd === 'run')
  t.ok(res.rest[0] === 'pear://runtime')
})

test('cmd with log-labels flag', async function (t) {
  t.plan(3)

  const res = cmd(['--log-labels', 'internal', 'run', 'pear://runtime'])

  t.ok(res.flags.logLabels === 'internal')
  t.ok(res.args.cmd === 'run')
  t.ok(res.rest[0] === 'pear://runtime')
})

test('cmd with log-fields flag', async function (t) {
  t.plan(3)

  const res = cmd(['--log-fields', 'date,time', 'run', 'pear://runtime'])

  t.ok(res.flags.logFields === 'date,time')
  t.ok(res.args.cmd === 'run')
  t.ok(res.rest[0] === 'pear://runtime')
})

test('cmd with log-stacks flag', async function (t) {
  t.plan(3)

  const res = cmd(['--log-stacks', 'run', 'pear://runtime'])

  t.ok(res.flags.logStacks === true)
  t.ok(res.args.cmd === 'run')
  t.ok(res.rest[0] === 'pear://runtime')
})

test('cmd with log flag', async function (t) {
  t.plan(3)

  const res = cmd(['--log', 'run', 'pear://runtime'])

  t.ok(res.flags.log === true)
  t.ok(res.args.cmd === 'run')
  t.ok(res.rest[0] === 'pear://runtime')
})

test('cmd with sidecar flag', async function (t) {
  t.plan(3)

  const res = cmd(['--sidecar', 'run', 'pear://runtime'])

  t.ok(res.flags.sidecar === true)
  t.ok(res.args.cmd === 'run')
  t.ok(res.rest[0] === 'pear://runtime')
})

test('cmd with rti flag', async function (t) {
  t.plan(3)

  const res = cmd(['--rti', 'info', 'run', 'pear://runtime'])

  t.ok(res.flags.rti === 'info')
  t.ok(res.args.cmd === 'run')
  t.ok(res.rest[0] === 'pear://runtime')
})

test('cmd with key flag', async function (t) {
  t.plan(3)

  const res = cmd(['--key', 'key123', 'run', 'pear://runtime'])

  t.ok(res.flags.key === 'key123')
  t.ok(res.args.cmd === 'run')
  t.ok(res.rest[0] === 'pear://runtime')
})

test('cmd with mem flag', async function (t) {
  t.plan(3)

  const res = cmd(['--mem', 'run', 'pear://runtime'])

  t.ok(res.flags.mem === true)
  t.ok(res.args.cmd === 'run')
  t.ok(res.rest[0] === 'pear://runtime')
})

test('cmd with dht-bootstrap flag', async function (t) {
  t.plan(3)

  const res = cmd(['--dht-bootstrap', 'nodes', 'run', 'pear://runtime'])

  t.ok(res.flags.dhtBootstrap === 'nodes')
  t.ok(res.args.cmd === 'run')
  t.ok(res.rest[0] === 'pear://runtime')
})

test('cmd with start-id flag', async function (t) {
  t.plan(3)

  const res = cmd(['--start-id', 'id123', 'run', 'pear://runtime'])

  t.ok(res.flags.startId === 'id123')
  t.ok(res.args.cmd === 'run')
  t.ok(res.rest[0] === 'pear://runtime')
})

test('cmd with run flag', async function (t) {
  t.plan(3)

  const res = cmd(['--run', 'run', 'pear://runtime'])

  t.ok(res.flags.run === true)
  t.ok(res.args.cmd === 'run')
  t.ok(res.rest[0] === 'pear://runtime')
})

test('cmd with sandbox flag', async function (t) {
  t.plan(3)

  const res = cmd(['--sandbox', 'run', 'pear://runtime'])

  t.ok(res.flags.sandbox === true)
  t.ok(res.args.cmd === 'run')
  t.ok(res.rest[0] === 'pear://runtime')
})

test('cmd with appling flag', async function (t) {
  t.plan(3)

  const res = cmd(['--appling', 'run', 'pear://runtime'])

  t.ok(res.flags.appling === true)
  t.ok(res.args.cmd === 'run')
  t.ok(res.rest[0] === 'pear://runtime')
})
