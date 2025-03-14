'use strict'

const { test } = require('brittle')

const cmd = require('../cmd')

test('cmd/pear with v flag', async function (t) {
  t.plan(1)

  const res = cmd(['-v'])

  t.ok(res.flags.v === true)
})

test('cmd/pear with log-level flag', async function (t) {
  t.plan(1)

  const res = cmd(['--log-level', '2'])

  t.ok(res.flags.logLevel === '2')
})

test('cmd/pear with log-labels flag', async function (t) {
  t.plan(1)

  const res = cmd(['--log-labels', 'internal'])

  t.ok(res.flags.logLabels === 'internal')
})

test('cmd/pear with log-fields flag', async function (t) {
  t.plan(1)

  const res = cmd(['--log-fields', 'date,time'])

  t.ok(res.flags.logFields === 'date,time')
})

test('cmd/pear with log-stacks flag', async function (t) {
  t.plan(1)

  const res = cmd(['--log-stacks'])

  t.ok(res.flags.logStacks === true)
})

test('cmd/pear with log flag', async function (t) {
  t.plan(1)

  const res = cmd(['--log'])

  t.ok(res.flags.log === true)
})

test('cmd/pear with sidecar flag', async function (t) {
  t.plan(1)

  const res = cmd(['--sidecar'])

  t.ok(res.flags.sidecar === true)
})

test('cmd/pear with rti flag', async function (t) {
  t.plan(1)

  const res = cmd(['--rti', 'info'])

  t.ok(res.flags.rti === 'info')
})

test('cmd/pear with key flag', async function (t) {
  t.plan(1)

  const res = cmd(['--key', 'key123'])

  t.ok(res.flags.key === 'key123')
})

test('cmd/pear with mem flag', async function (t) {
  t.plan(1)

  const res = cmd(['--mem'])

  t.ok(res.flags.mem === true)
})

test('cmd/pear with dht-bootstrap flag', async function (t) {
  t.plan(1)

  const res = cmd(['--dht-bootstrap', 'nodes'])

  t.ok(res.flags.dhtBootstrap === 'nodes')
})

test('cmd/pear with start-id flag', async function (t) {
  t.plan(1)

  const res = cmd(['--start-id', 'id123'])

  t.ok(res.flags.startId === 'id123')
})

test('cmd/pear with run flag', async function (t) {
  t.plan(1)

  const res = cmd(['--run'])

  t.ok(res.flags.run === true)
})

test('cmd/pear with sandbox flag', async function (t) {
  t.plan(1)

  const res = cmd(['--sandbox'])

  t.ok(res.flags.sandbox === true)
})

test('cmd/pear with appling flag', async function (t) {
  t.plan(1)

  const res = cmd(['--appling'])

  t.ok(res.flags.appling === true)
})

test('cmd/pear with v and log-level flags', async function (t) {
  t.plan(2)

  const res = cmd(['-v', '--log-level', '2'])

  t.ok(res.flags.v === true)
  t.ok(res.flags.logLevel === '2')
})

test('cmd/pear with log-labels and log-fields flags', async function (t) {
  t.plan(2)

  const res = cmd(['--log-labels', 'internal', '--log-fields', 'date,time'])

  t.ok(res.flags.logLabels === 'internal')
  t.ok(res.flags.logFields === 'date,time')
})

test('cmd/pear with log-stacks and log flags', async function (t) {
  t.plan(2)

  const res = cmd(['--log-stacks', '--log'])

  t.ok(res.flags.logStacks === true)
  t.ok(res.flags.log === true)
})

test('cmd/pear with sidecar and rti flags', async function (t) {
  t.plan(2)

  const res = cmd(['--sidecar', '--rti', 'info'])

  t.ok(res.flags.sidecar === true)
  t.ok(res.flags.rti === 'info')
})

test('cmd/pear with key and mem flags', async function (t) {
  t.plan(2)

  const res = cmd(['--key', 'key123', '--mem'])

  t.ok(res.flags.key === 'key123')
  t.ok(res.flags.mem === true)
})

test('cmd/pear with dht-bootstrap and start-id flags', async function (t) {
  t.plan(2)

  const res = cmd(['--dht-bootstrap', 'nodes', '--start-id', 'id123'])

  t.ok(res.flags.dhtBootstrap === 'nodes')
  t.ok(res.flags.startId === 'id123')
})

test('cmd/pear with run and sandbox flags', async function (t) {
  t.plan(2)

  const res = cmd(['--run', '--sandbox'])

  t.ok(res.flags.run === true)
  t.ok(res.flags.sandbox === true)
})

test('cmd/pear with appling and v flags', async function (t) {
  t.plan(2)

  const res = cmd(['--appling', '-v'])

  t.ok(res.flags.appling === true)
  t.ok(res.flags.v === true)
})
