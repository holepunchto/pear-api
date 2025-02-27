'use strict'

const { test } = require('brittle')

const Helper = require('./helper')

test('restart terminal app throw error', async function (t) {
  t.plan(1)

  const teardown = Helper.rig({ state: { ui: null } })
  t.teardown(teardown)

  t.exception(() => Pear.restart(), 'Pear.restart threw an error for terminal app')
})

test('restart ok', async function (t) {
  t.plan(2)

  await Helper.startIpcServer({
    handlers: {
      restart: (opts) => ({ ...opts, time: Date.now() })
    },
    teardown: t.teardown
  })
  const ipc = await Helper.startIpcClient()

  const teardown = Helper.rig({ ipc })
  t.teardown(teardown)

  const res = await Pear.restart({ hello: 'world' })
  t.ok(res.hello === 'world', 'restart returned')
  t.ok(typeof res.time === 'number' && res.time <= Date.now(), 'restart has time')
})
