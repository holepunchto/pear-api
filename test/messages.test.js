'use strict'

const { test } = require('brittle')
const Iambus = require('iambus')

const Helper = require('./helper')

const noop = () => undefined

test('messages single', async function (t) {
  t.plan(2)

  const bus = new Iambus()
  t.teardown(() => bus.destroy())

  const ipc = {
    ref: noop,
    unref: noop,
    messages: (pattern) => bus.sub(pattern)
  }
  const teardown = Helper.rig({ ipc })
  t.teardown(teardown)

  const promise = new Promise((resolve) => {
    const sub = Pear.messages({ hello: 'world' }, (msg) => {
      sub.end()
      resolve(msg)
    })
  })
  bus.pub({ hello: 'world', time: Date.now() })

  const msg = await promise
  t.is(msg.hello, 'world', 'message matches')
  t.ok(typeof msg.time === 'number' && msg.time <= Date.now(), 'message has time')
})

test('messages multiple', async function (t) {
  t.plan(3)

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

  const promise = new Promise((resolve) => {
    const messages = []
    const sub = Pear.messages({ hello: 'world' }, (msg) => {
      messages.push(msg)
      if (messages.length === 4) {
        clearInterval(interval)
        sub.end()
        resolve(messages)
      }
    })
  })

  const messages = await promise
  t.is(messages.length, 4, 'received 4 messages')
  t.ok(messages.every(msg => msg.hello === 'world'), 'all messages match')
  t.ok(messages.every(msg => typeof msg.time === 'number' && msg.time <= Date.now()), 'all messages have time')
})

test('messages legacy', async function (t) {
  t.plan(2)

  const bus = new Iambus()
  t.teardown(() => bus.destroy())

  const ipc = {
    ref: noop,
    unref: noop,
    messages: (pattern) => bus.sub(pattern)
  }
  const teardown = Helper.rig({ ipc })
  t.teardown(teardown)

  const promise = new Promise((resolve) => {
    const sub = Pear.messages((msg) => {
      sub.end()
      resolve(msg)
    })
  })
  bus.pub({ hello: 'world', time: Date.now() })

  const msg = await promise
  t.is(msg.hello, 'world', 'message matches')
  t.ok(typeof msg.time === 'number' && msg.time <= Date.now(), 'message has time')
})
