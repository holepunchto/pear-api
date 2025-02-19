'use strict'

const { isWindows } = require('which-runtime')
const { test } = require('brittle')
const Iambus = require('iambus')
const { Server, Client } = require('pear-ipc')

const Helper = require('./helper')

const socketPath = isWindows ? '\\\\.\\pipe\\pear-api-test-ipc' : 'test.sock'

test('messages client-server', async function (t) {
  t.plan(3)

  const server = new Server({
    socketPath,
    handlers: {
      messages: (pattern) => {
        const bus = new Iambus()
        const interval = setInterval(() => bus.pub({ hello: 'world', time: Date.now() }), 500)
        const stream = bus.sub(pattern)
        stream.on('close', () => clearInterval(interval))
        return stream
      }
    }
  })
  t.teardown(() => server.close())
  await server.ready()

  const client = new Client({
    socketPath,
    connect: true
  })
  t.teardown(() => client.close())
  await client.ready()

  const teardown = Helper.rig({ ipc: client })
  t.teardown(teardown)

  const promise = new Promise((resolve) => {
    const messages = []
    const sub = Pear.messages({ hello: 'world' }, (msg) => {
      messages.push(msg)
      if (messages.length === 4) {
        sub.destroy()
        resolve(messages)
      }
    })
  })

  const messages = await promise
  t.is(messages.length, 4, 'received 4 messages')
  t.ok(messages.every(msg => msg.hello === 'world'), 'all messages match')
  t.ok(messages.every(msg => typeof msg.time === 'number' && msg.time <= Date.now()), 'all messages have time')
})
