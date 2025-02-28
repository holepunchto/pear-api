'use strict'

const { test } = require('brittle')
const Iambus = require('iambus')

const Helper = require('./helper')

test('Pear.wakeups trigger', async function (t) {
  t.plan(3)

  const bus = new Iambus()
  await Helper.startIpcServer({
    handlers: {
      messages: (pattern) => {
        const stream = bus.sub(pattern)
        stream.push({ type: 'subscribed', pattern })
        return stream
      },
      message: (pattern) => { bus.pub({ ...pattern, time: Date.now() }) }
    },
    teardown: t.teardown
  })
  const ipc = await Helper.startIpcClient()

  const teardown = Helper.rig({ ipc })
  t.teardown(teardown)

  const subscribed = Helper.createLazyPromise()
  const received = Helper.createLazyPromise()
  const stream = Pear.wakeups((data) => {
    if (data.type === 'subscribed') {
      if (data.pattern.type === 'pear/wakeup') {
        subscribed.resolve()
      }
      return
    }
    received.resolve(data)
  })
  t.teardown(() => stream.destroy())

  await subscribed.promise
  await Pear.message({ type: 'pear/wakeup', hello: 'world' })

  const msg = await received.promise
  t.ok(msg.type === 'pear/wakeup', 'wakeups triggered')
  t.ok(msg.hello === 'world', 'message received')
  t.ok(typeof msg.time === 'number' && msg.time <= Date.now(), 'message has time')

  await Helper.untilClose(stream)
})
