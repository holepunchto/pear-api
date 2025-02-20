'use strict'

const { isWindows } = require('which-runtime')
const { test } = require('brittle')
const path = require('path')
const Iambus = require('iambus')
const { Server, Client } = require('pear-ipc')

const Helper = require('./helper')

const dirname = __dirname
const socketPath = isWindows ? '\\\\.\\pipe\\pear-api-test-ipc' : 'test.sock'

test('messages single client', async function (t) {
  t.plan(3)

  async function startIpcServer () {
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
    await server.ready()
    return server
  }

  async function startIpcClient () {
    const client = new Client({
      socketPath,
      connect: true
    })
    await client.ready()
    return client
  }

  const server = await startIpcServer()
  const client = await startIpcClient()

  const teardown = Helper.rig({ ipc: client })
  t.teardown(teardown)

  const promise = new Promise((resolve) => {
    const messages = []
    const sub = Pear.messages({ hello: 'world' }, (data) => {
      messages.push(data)
      if (messages.length === 4) {
        sub.destroy()
        resolve(messages)
      }
    })
    t.teardown(() => sub.destroy())
  })

  const messages = await promise
  t.is(messages.length, 4, 'received 4 messages')
  t.ok(messages.every(msg => msg.hello === 'world'), 'all messages match')
  t.ok(messages.every(msg => typeof msg.time === 'number' && msg.time <= Date.now()), 'all messages have time')
})

test.skip('messages multi clients', async function (t) {
  t.plan(1)

  async function startIpcServer () {
    const bus = new Iambus()
    const server = new Server({
      socketPath,
      handlers: {
        message: (pattern) => { return bus.pub(pattern) },
        messages: (pattern) => { return bus.sub(pattern) }
      }
    })
    await server.ready()
    return server
  }

  async function startIpcClient () {
    const client = new Client({
      socketPath,
      connect: true
    })
    await client.ready()
    return client
  }

  const server = await startIpcServer()
  const client = await startIpcClient()

  const dir = path.join(dirname, 'fixtures', 'run-messages-client')
  const teardown = Helper.rig({ ipc: client, runtimeArgv: [dir] })
  t.teardown(teardown)

  const pipe = Pear.run(dir)

  // wait for run-messages-client to subscribe
  await new Promise((resolve) => setTimeout(resolve, 2000))

  await Pear.message({ type: 'broadcast', tag: 'hello', msg: 'pear1' })

  const msg = await Helper.untilResult(pipe)
  t.is(msg, 'pear1', 'message received')
})
