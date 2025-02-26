'use strict'

const { test } = require('brittle')
const path = require('path')
const Iambus = require('iambus')

const Helper = require('./helper')

const dirname = __dirname

test('messages single client', async function (t) {
  t.plan(3)

  const bus = new Iambus()
  await Helper.startIpcServer({
    handlers: {
      messages: (pattern) => {
        bus.pub({ type: 'subscribed', pattern })
        return bus.sub(pattern)
      },
      message: (pattern) => {
        bus.pub({ ...pattern, time: Date.now() })
        bus.pub({ ...pattern, time: Date.now() })
        bus.pub({ ...pattern, time: Date.now() })
        bus.pub({ ...pattern, time: Date.now() })
      }
    },
    teardown: t.teardown
  })
  const ipc = await Helper.startIpcClient()

  const teardown = Helper.rig({ ipc })
  t.teardown(teardown)

  const subscribed = Helper.createLazyPromise()
  const subscribedStream = Pear.messages({ type: 'subscribed' }, (data) => {
    if (data.pattern.hello === 'world') {
      subscribed.resolve()
    }
  })
  t.teardown(() => subscribedStream.destroy())

  const messages = []
  const received = Helper.createLazyPromise()
  const receivedStream = Pear.messages({ hello: 'world' }, (data) => {
    messages.push(data)
    if (messages.length === 4) {
      received.resolve()
    }
  })
  t.teardown(() => receivedStream.destroy())

  await subscribed.promise
  await Pear.message({ hello: 'world' })

  await received.promise
  t.is(messages.length, 4, 'received 4 messages')
  t.ok(messages.every(msg => msg.hello === 'world'), 'all messages match')
  t.ok(messages.every(msg => typeof msg.time === 'number' && msg.time <= Date.now()), 'all messages have time')

  await Helper.untilClose(receivedStream)
  await Helper.untilClose(subscribedStream)
})

test('messages multi clients', async function (t) {
  t.plan(1)

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

  const dir = path.join(dirname, 'fixtures', 'run-messages-client')
  const teardown = Helper.rig({ ipc, runtimeArgv: [dir] })
  t.teardown(teardown)

  const subscribed = Helper.createLazyPromise()
  const subscribedStream = Pear.messages({ type: 'subscribed' }, (data) => {
    if (data.pattern.hello === 'world') {
      subscribed.resolve()
    }
  })
  t.teardown(() => subscribedStream.destroy())

  const pipe = Pear.run(dir)

  await subscribed.promise
  await Pear.message({ hello: 'world', msg: 'pear1' })

  const msg = await Helper.untilResult(pipe)
  t.ok(msg === 'pear1', 'message received')

  await Helper.untilClose(subscribedStream)
  await Helper.untilClose(pipe)
})

test('messages legacy api', async function (t) {
  t.plan(2)

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
    if (data.pattern) {
      subscribed.resolve()
    }
  })
  t.teardown(() => subscribedStream.destroy())

  const received = Helper.createLazyPromise()
  // in the legacy API, the listener is the first argument
  const receivedStream = Pear.messages((data) => { received.resolve(data) })
  t.teardown(() => receivedStream.destroy())

  await subscribed.promise
  await Pear.message({ hello: 'world' })

  const msg = await received.promise
  t.ok(msg.hello === 'world', 'message received')
  t.ok(typeof msg.time === 'number' && msg.time <= Date.now(), 'message has time')

  await Helper.untilClose(receivedStream)
  await Helper.untilClose(subscribedStream)
})
