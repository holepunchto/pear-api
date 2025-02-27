'use strict'

const { test } = require('brittle')

const Helper = require('./helper')

test('Pear.get returns', async function (t) {
  t.plan(3)

  await Helper.startIpcServer({
    handlers: {
      get: ({ key, ...opts }) => ({ key, ...opts, time: Date.now() })
    },
    teardown: t.teardown
  })
  const ipc = await Helper.startIpcClient()

  const teardown = Helper.rig({ ipc })
  t.teardown(teardown)

  const res = await Pear.get('hello', { magic: 'trick' })
  t.ok(res.key === 'hello', 'get returned')
  t.ok(res.magic === 'trick', 'get has data')
  t.ok(typeof res.time === 'number' && res.time <= Date.now(), 'versions has time')
})
