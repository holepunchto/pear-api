'use strict'

const { test } = require('brittle')

const Helper = require('./helper')

test('Pear.exists returns', async function (t) {
  t.plan(2)

  await Helper.startIpcServer({
    handlers: {
      exists: ({ key }) => ({ key, time: Date.now() })
    },
    teardown: t.teardown
  })
  const ipc = await Helper.startIpcClient()

  const teardown = Helper.rig({ ipc })
  t.teardown(teardown)

  const res = await Pear.exists('hello')
  t.ok(res.key === 'hello', 'exists returned')
  t.ok(typeof res.time === 'number' && res.time <= Date.now(), 'versions has time')
})
