'use strict'

const { test } = require('brittle')
const Iambus = require('iambus')

const Helper = require('./helper')

test('Pear.updates trigger', async function (t) {
  t.plan(3)

  const bus = new Iambus()
  await Helper.startIpcServer({
    handlers: {
      messages: (pattern) => {
        bus.pub({ type: 'subscribed', pattern })
        return bus.sub(pattern)
      },
      message: (pattern) => { bus.pub({ ...pattern, time: Date.now() }) }
    },
    teardown: t.teardown
  })
  const ipc = await Helper.startIpcClient()

  const teardown = Helper.rig({ ipc })
  t.teardown(teardown)

  const subscribed = Helper.createLazyPromise()
  const subscribedStream = Pear.messages({ type: 'subscribed' }, (data) => {
    if (data.pattern.type === 'pear/updates') {
      subscribed.resolve()
    }
  })
  t.teardown(() => subscribedStream.destroy())

  const received = Helper.createLazyPromise()
  const receivedStream = Pear.updates((data) => { received.resolve(data) })
  t.teardown(() => receivedStream.destroy())

  await subscribed.promise
  await Pear.message({ type: 'pear/updates', hello: 'world' })

  const msg = await received.promise
  t.ok(msg.type === 'pear/updates', 'updates triggered')
  t.ok(msg.hello === 'world', 'message received')
  t.ok(typeof msg.time === 'number' && msg.time <= Date.now(), 'message has time')

  await Helper.untilClose(receivedStream)
  await Helper.untilClose(subscribedStream)
})
