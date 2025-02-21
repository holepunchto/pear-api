'use strict'

const { test } = require('brittle')
const path = require('path')
const Iambus = require('iambus')

const Helper = require('./helper')

const dirname = __dirname

test('messages single client', async function (t) {
  t.plan(3)

  await Helper.startIpcServer({
    handlers: {
      messages: (pattern) => {
        const bus = new Iambus()
        const interval = setInterval(() => bus.pub({ hello: 'world', time: Date.now() }), 500)
        const stream = bus.sub(pattern)
        stream.on('close', () => clearInterval(interval))
        return stream
      }
    },
    teardown: t.teardown
  })
  const ipc = await Helper.startIpcClient()

  const teardown = Helper.rig({ ipc })
  t.teardown(teardown)

  const messages = []
  const lazyPromise = Helper.createLazyPromise()
  const sub = Pear.messages({ hello: 'world' }, (data) => {
    messages.push(data)
    if (messages.length === 4) {
      lazyPromise.resolve()
    }
  })
  t.teardown(() => sub.destroy())

  await lazyPromise.promise
  t.is(messages.length, 4, 'received 4 messages')
  t.ok(messages.every(msg => msg.hello === 'world'), 'all messages match')
  t.ok(messages.every(msg => typeof msg.time === 'number' && msg.time <= Date.now()), 'all messages have time')

  await Helper.untilClose(sub)
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
      message: (pattern) => { return bus.pub(pattern) }
    },
    teardown: t.teardown
  })
  const ipc = await Helper.startIpcClient()

  const dir = path.join(dirname, 'fixtures', 'run-messages-client')
  const teardown = Helper.rig({ ipc, runtimeArgv: [dir] })
  t.teardown(teardown)

  const lazyPromise = Helper.createLazyPromise()
  const sub = Pear.messages({ type: 'subscribed' }, (data) => {
    if (data.pattern.type === 'broadcast' && data.pattern.tag === 'hello') {
      lazyPromise.resolve()
    }
  })
  t.teardown(() => sub.destroy())

  const pipe = Pear.run(dir)

  // wait for Pear.messages in Pear.run process to finish subscribing
  await lazyPromise.promise

  // send message to server to broadcast it to all clients
  await Pear.message({ type: 'broadcast', tag: 'hello', msg: 'pear1' })

  // Pear.run process should receive the message
  const msg = await Helper.untilResult(pipe)
  t.is(msg, 'pear1', 'message received')

  await Helper.untilClose(sub)
})
