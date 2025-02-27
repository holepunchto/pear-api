'use strict'

const { test } = require('brittle')

const Helper = require('./helper')

test('Pear.checkpoint returns', async function (t) {
  t.plan(5)

  await Helper.startIpcServer({
    handlers: {
      checkpoint: (state) => ({ ...state, time: Date.now() })
    },
    teardown: t.teardown
  })
  const ipc = await Helper.startIpcClient()

  const state = {
    config: { hello: 'world' }
  }
  const teardown = Helper.rig({ ipc, state })
  t.teardown(teardown)

  t.ok(Pear.config.hello === 'world', 'Pear.config is set')

  const cp = await Pear.checkpoint({ magic: 'trick' })
  t.ok(cp.magic === 'trick', 'checkpoint returned')
  t.ok(typeof cp.time === 'number' && cp.time <= Date.now(), 'checkpoint has time')

  t.ok(Pear.config.hello === 'world', 'Pear.config is still set')
  t.ok(Pear.config.checkpoint.magic === 'trick', 'Pear.config is updated')
})
