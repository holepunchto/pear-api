'use strict'

const { test } = require('brittle')
const Iambus = require('iambus')

const Helper = require('./helper')

const noop = () => undefined

test('messages pattern', async function (t) {
  t.plan(2)

  const bus = new Iambus()
  t.teardown(() => bus.destroy())
  const interval = setInterval(() => bus.pub({ hello: 'world', time: Date.now() }), 500)

  const ipc = {
    ref: noop,
    unref: noop,
    messages: (pattern) => bus.sub(pattern)
  }
  const teardown = Helper.rig({ ipc })
  t.teardown(teardown)

  const msg = await new Promise((resolve) => {
    const sub = Pear.messages({ hello: 'world' }, (msg) => {
      clearInterval(interval)
      sub.end()
      resolve(msg)
    })
  })
  t.is(msg.hello, 'world')
  t.ok(typeof msg.time === 'number' && msg.time <= Date.now())
})
