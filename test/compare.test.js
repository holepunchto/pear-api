'use strict'

const { test } = require('brittle')

const Helper = require('./helper')

test('Pear.compare returns', async function (t) {
  t.plan(4)

  await Helper.startIpcServer({
    handlers: {
      compare: ({ keyA, keyB }) => ({ keyA, keyB, check: keyA === keyB, time: Date.now() })
    },
    teardown: t.teardown
  })
  const ipc = await Helper.startIpcClient()

  const teardown = Helper.rig({ ipc })
  t.teardown(teardown)

  const res = await Pear.compare('hello', 'world')
  t.ok(res.keyA === 'hello', 'compare returned keyA')
  t.ok(res.keyB === 'world', 'compare returned keyB')
  t.ok(res.check === false, 'compare returned check')
  t.ok(typeof res.time === 'number' && res.time <= Date.now(), 'compare has time')
})
