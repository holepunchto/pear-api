'use strict'

const { test } = require('brittle')

const Helper = require('./helper')

test('Pear.versions returns', async function (t) {
  t.plan(2)

  await Helper.startIpcServer({
    handlers: {
      versions: () => ({ hello: 'world', time: Date.now() })
    },
    teardown: t.teardown
  })
  const ipc = await Helper.startIpcClient()

  const teardown = Helper.rig({ ipc })
  t.teardown(teardown)

  const ver = await Pear.versions()
  t.ok(ver.hello === 'world', 'versions returned')
  t.ok(typeof ver.time === 'number' && ver.time <= Date.now(), 'versions has time')
})
