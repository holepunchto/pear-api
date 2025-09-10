'use strict'

const { test } = require('brittle')
const { isWindows, isBare } = require('which-runtime')
const { Readable } = require('streamx')
const path = require('path')
const os = require('os')
const Iambus = require('iambus')
const process = require('process')
const run = require('pear-run')

const Helper = require('./helper')

const dirname = __dirname

//
// messages
//

test('Pear.messages single client', async function (t) {
  t.plan(3)

  const bus = new Iambus()
  await Helper.startIpcServer({
    handlers: {
      messages: (pattern) => {
        const stream = bus.sub(pattern)
        stream.push({ type: 'subscribed', pattern })
        return stream
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

  const stream = Pear.messages({ hello: 'world' })
  t.teardown(() => stream.destroy())

  await new Promise((resolve) => {
    stream.on('data', (data) => {
      if (data.type !== 'subscribed') return
      if (data.pattern.hello === 'world') resolve()
    })
  })

  const received = new Promise((resolve) => {
    const messages = []
    stream.on('data', (data) => {
      if (data.type === 'subscribed') return
      messages.push(data)
      if (messages.length === 4) {
        resolve(messages)
      }
    })
  })

  await Pear.message({ hello: 'world' })

  const messages = await received
  t.is(messages.length, 4, 'received 4 messages')
  t.ok(messages.every(msg => msg.hello === 'world'), 'all messages match')
  t.ok(messages.every(msg => typeof msg.time === 'number' && msg.time <= Date.now()), 'all messages have time')

  await Helper.untilClose(stream)
})

test('Pear.messages multi clients', async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'run-messages-client')

  const bus = new Iambus()
  await Helper.startIpcServer({
    handlers: {
      messages: (pattern) => {
        const stream = bus.sub(pattern)
        stream.push({ type: 'subscribed', pattern })
        bus.pub({ type: 'subscribed', pattern })
        return stream
      },
      message: (pattern) => { bus.pub({ ...pattern, time: Date.now() }) }
    },
    teardown: t.teardown
  })
  const ipc = await Helper.startIpcClient()

  const teardown = Helper.rig({ ipc })
  t.teardown(teardown)

  const stream = Pear.messages({ type: 'subscribed' })
  t.teardown(() => stream.destroy())

  const subscribed = new Promise((resolve) => {
    stream.on('data', (data) => {
      if (data.type !== 'subscribed') return
      if (data.pattern.hello === 'world') resolve()
    })
  })

  const pipe = run(dir)

  await subscribed
  await Pear.message({ hello: 'world', msg: 'pear1' })

  const msg = await Helper.untilResult(pipe)
  t.is(msg, 'pear1', 'message received')

  await Helper.untilClose(stream)
  await Helper.untilClose(pipe)
})

test('Pear.messages with no listener', async function (t) {
  t.plan(1)

  const bus = new Iambus()
  await Helper.startIpcServer({
    handlers: {
      messages: (pattern) => { return bus.sub(pattern) },
      message: (pattern) => { bus.pub(pattern) }
    },
    teardown: t.teardown
  })
  const ipc = await Helper.startIpcClient()

  const teardown = Helper.rig({ ipc })
  t.teardown(teardown)

  const stream = Pear.messages({ hello: 'world' })
  t.teardown(() => stream.destroy())

  await Pear.message({ hello: 'world' })

  await Helper.untilClose(stream)
  t.pass('no listener did not throw')
})

test('Pear.messages with no pattern', async function (t) {
  t.plan(2)

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

  const stream = Pear.messages()
  t.teardown(() => stream.destroy())

  await new Promise((resolve) => {
    stream.on('data', (data) => {
      if (data.type !== 'subscribed') return
      resolve()
    })
  })

  const received = new Promise((resolve) => {
    stream.on('data', (data) => {
      if (data.type === 'subscribed') return
      resolve(data)
    })
  })

  await Pear.message({ hello: 'world' })

  const msg = await received
  t.is(msg.hello, 'world', 'message received')
  t.ok(typeof msg.time === 'number' && msg.time <= Date.now(), 'message has time')

  await Helper.untilClose(stream)
})

//
// checkpoint
//

test('Pear.checkpoint returns', async function (t) {
  t.plan(5)

  await Helper.startIpcServer({
    handlers: {
      checkpoint: (state) => ({ ...state, time: Date.now() })
    },
    teardown: t.teardown
  })
  const ipc = await Helper.startIpcClient()

  const state = {
    config: { hello: 'world' }
  }
  const teardown = Helper.rig({ ipc, state })
  t.teardown(teardown)

  t.is(Pear.config.hello, 'world', 'Pear.config is set')

  const cp = await Pear.checkpoint({ magic: 'trick' })
  t.is(cp.magic, 'trick', 'checkpoint returned')
  t.ok(typeof cp.time === 'number' && cp.time <= Date.now(), 'checkpoint has time')

  t.is(Pear.config.hello, 'world', 'Pear.config is still set')
  t.is(Pear.config.checkpoint.magic, 'trick', 'Pear.config is updated')
})

//
// versions
//

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
  t.is(ver.hello, 'world', 'versions returned')
  t.ok(typeof ver.time === 'number' && ver.time <= Date.now(), 'versions has time')
})

//
// run
//

test('Pear.worker.run -> pipe', async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'run')

  const teardown = Helper.rig()
  t.teardown(teardown)

  const pipe = run(dir)

  pipe.on('error', (err) => {
    if (err.code === 'ENOTCONN') return // when the other side destroys the pipe
    throw err
  })

  const messages = []
  const response = new Promise((resolve) => {
    pipe.on('data', (data) => {
      messages.push(data.toString())
      if (messages.length === 4) resolve(messages.join(''))
    })
  })

  pipe.write('ping')

  const runResponse = await response
  t.is(runResponse, '0123', 'pear pipe can send and receive data')

  pipe.write('exit')
})

test('Pear.worker.run Pear.worker.pipe', async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'legacy-worker-pipe')

  const teardown = Helper.rig()
  t.teardown(teardown)

  const pipe = Pear.worker.run(dir)

  pipe.on('error', (err) => {
    if (err.code === 'ENOTCONN') return // when the other side destroys the pipe
    throw err
  })

  const messages = []
  const response = new Promise((resolve) => {
    pipe.on('data', (data) => {
      messages.push(data.toString())
      if (messages.length === 4) resolve(messages.join(''))
    })
  })

  pipe.write('ping')

  const runResponse = await response
  t.is(runResponse, '0123', 'pear pipe can send and receive data')

  pipe.write('exit')
})

test('run args become Pear.config.args', async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'print-args')

  const teardown = Helper.rig()
  t.teardown(teardown)

  const args = ['hello', 'world']
  const pipe = run(dir, args)

  const result = JSON.parse(await Helper.untilResult(pipe))

  t.alike(result, args, 'run should receive args from the parent')

  await Helper.untilClose(pipe)
})

test('run args become Pear.config.args', async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'print-args')

  const teardown = Helper.rig()
  t.teardown(teardown)

  const args = ['hello', 'world']
  const pipe = run(dir, args)

  const result = JSON.parse(await Helper.untilResult(pipe))

  t.alike(result, args, 'run should receive args from the parent')

  await Helper.untilClose(pipe)
})

test('run should run inside run', async function (t) {
  t.plan(1)

  const runDir = path.join(dirname, 'fixtures', 'run-runner')
  const helloWorldDir = path.join(dirname, 'fixtures', 'hello-world')

  const teardown = Helper.rig()
  t.teardown(teardown)

  const pipe = run(runDir, [helloWorldDir])

  const response = await Helper.untilResult(pipe)

  t.is(response, 'hello world', 'run should send expected response')

  await Helper.untilClose(pipe)
})

test('run exit when child calls pipe.end()', async function (t) {
  const runParent = path.join(dirname, 'fixtures', 'run-parent')
  const runEndFromChild = path.join(dirname, 'fixtures', 'run-end-from-child')

  const teardown = Helper.rig()
  t.teardown(teardown)

  const pipe = run(runParent, [runEndFromChild])
  pipe.on('end', () => pipe.end())

  const pid = await Helper.untilResult(pipe)
  await Helper.untilExit(pid)
})

test('run exit when child calls pipe.destroy()', async function (t) {
  const runParentErrorHandler = path.join(dirname, 'fixtures', 'run-parent-error-handler')
  const runDestroyFromChild = path.join(dirname, 'fixtures', 'run-destroy-from-child')

  const teardown = Helper.rig()
  t.teardown(teardown)

  const pipe = run(runParentErrorHandler, [runDestroyFromChild])
  pipe.on('end', () => pipe.end())

  const pid = await Helper.untilResult(pipe)
  await Helper.untilExit(pid)
})

test('run exit when parent calls pipe.end()', async function (t) {
  const runEndFromParent = path.join(dirname, 'fixtures', 'run-end-from-parent')
  const runChild = path.join(dirname, 'fixtures', 'run-child')

  const teardown = Helper.rig()
  t.teardown(teardown)

  const pipe = run(runEndFromParent, [runChild])
  pipe.on('end', () => pipe.end())

  const pid = await Helper.untilResult(pipe)
  await Helper.untilExit(pid)
})

test('run exit when parent calls pipe.destroy()', async function (t) {
  const runDestroyFromParent = path.join(dirname, 'fixtures', 'run-destroy-from-parent')
  const runChildErrorHandler = path.join(dirname, 'fixtures', 'run-child-error-handler')

  const teardown = Helper.rig()
  t.teardown(teardown)

  const pipe = run(runDestroyFromParent, [runChildErrorHandler])
  pipe.on('end', () => pipe.end())

  const pid = await Helper.untilResult(pipe)
  await Helper.untilExit(pid)
})

//
// restart
//

test('Pear.restart terminal app throw error', async function (t) {
  t.plan(1)

  const teardown = Helper.rig({ state: { ui: null } })
  t.teardown(teardown)

  t.exception(() => Pear.restart(), 'Pear.restart threw an error for terminal app')
})

test('Pear.restart ok', async function (t) {
  t.plan(2)

  await Helper.startIpcServer({
    handlers: {
      restart: (opts) => ({ ...opts, time: Date.now() })
    },
    teardown: t.teardown
  })
  const ipc = await Helper.startIpcClient()

  const teardown = Helper.rig({ ipc })
  t.teardown(teardown)

  const res = await Pear.restart({ hello: 'world' })
  t.is(res.hello, 'world', 'restart returned')
  t.ok(typeof res.time === 'number' && res.time <= Date.now(), 'restart has time')
})

//
// reload
//

test('Pear.reload terminal app throw error', async function (t) {
  t.plan(1)

  const teardown = Helper.rig({ state: { ui: null } })
  t.teardown(teardown)

  t.exception(() => Pear.reload(), 'Pear.reload threw an error for terminal app')
})

test('Pear.reload desktop app throw error', async function (t) {
  t.plan(1)

  const teardown = Helper.rig()
  t.teardown(teardown)

  t.exception(() => Pear.reload({ platform: 'darwin' }), 'Pear.reload threw an error for desktop app')
})

test('Pear.reload ok', async function (t) {
  t.plan(1)

  const teardown = Helper.rig()
  t.teardown(teardown)

  const reloaded = new Promise((resolve) => {
    global.location = { reload: () => resolve() }
  })

  Pear.reload()

  await reloaded
  t.pass('Pear.reload ok')
})

//
// updates
//

test('Pear.updates trigger', async function (t) {
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

  const stream = Pear.updates()
  t.teardown(() => stream.destroy())

  await new Promise((resolve) => {
    stream.on('data', (data) => {
      if (data.type !== 'subscribed') return
      if (data.pattern.type === 'pear/updates') resolve()
    })
  })

  const received = new Promise((resolve) => {
    stream.on('data', (data) => {
      if (data.type === 'subscribed') return
      resolve(data)
    })
  })

  await Pear.message({ type: 'pear/updates', hello: 'world' })

  const msg = await received
  t.is(msg.type, 'pear/updates', 'updates triggered')
  t.is(msg.hello, 'world', 'message received')
  t.ok(typeof msg.time === 'number' && msg.time <= Date.now(), 'message has time')

  await Helper.untilClose(stream)
})

//
// wakeups
//

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

  const stream = Pear.wakeups()
  t.teardown(() => stream.destroy())

  await new Promise((resolve) => {
    stream.on('data', (data) => {
      if (data.type !== 'subscribed') return
      if (data.pattern.type === 'pear/wakeup') resolve()
    })
  })

  const received = new Promise((resolve) => {
    stream.on('data', (data) => {
      if (data.type === 'subscribed') return
      resolve(data)
    })
  })

  await Pear.message({ type: 'pear/wakeup', hello: 'world' })

  const msg = await received
  t.is(msg.type, 'pear/wakeup', 'wakeups triggered')
  t.is(msg.hello, 'world', 'message received')
  t.ok(typeof msg.time === 'number' && msg.time <= Date.now(), 'message has time')

  await Helper.untilClose(stream)
})

//
// teardown
//

test('Pear.teardown on pipe end', { skip: !isBare || isWindows }, async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'run-teardown')

  const teardown = Helper.rig()
  t.teardown(teardown)

  const pipe = run(dir)

  const td = await Helper.untilResult(pipe, { runFn: () => pipe.end() })
  t.is(td, 'teardown', 'teardown executed')
})

test('Pear.teardown on os kill', { skip: !isBare || isWindows }, async function (t) {
  t.plan(2)

  const dir = path.join(dirname, 'fixtures', 'run-teardown-os-kill')

  const teardown = Helper.rig()
  t.teardown(teardown)

  const pipe = run(dir)

  pipe.on('error', (err) => {
    if (err.code === 'ENOTCONN') return // when the other side destroys the pipe
    throw err
  })

  const pid = +(await Helper.untilResult(pipe))
  t.ok(pid > 0, 'pid is valid')

  const td = await Helper.untilResult(pipe, { runFn: () => os.kill(pid) })
  t.is(td, 'teardown', 'teardown executed')
})

test('Pear.teardown run wait', { skip: !isBare || isWindows }, async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'run-teardown-wait')

  const teardown = Helper.rig()
  t.teardown(teardown)

  const pipe = run(dir)

  const td = await Helper.untilResult(pipe, { runFn: () => pipe.end() })
  t.is(td, 'teardown', 'teardown executed')
})

test('Pear.teardown throw error', { skip: !isBare || isWindows }, async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'run-teardown-error')

  const teardown = Helper.rig()
  t.teardown(teardown)

  const pipe = run(dir)

  const td = await Helper.untilResult(pipe, { runFn: () => pipe.end() })
  t.is(td, 'teardown', 'teardown executed')
})

//
// exit
//

test('Pear.exit', async function (t) {
  t.plan(1)

  const teardown = Helper.rig()
  t.teardown(teardown)

  const originalExit = isBare ? Bare.exit : process.exit
  const exited = new Promise((resolve) => {
    if (isBare) Bare.exit = () => resolve(true)
    else process.exit = () => resolve(true)
  })
  t.teardown(() => {
    if (isBare) Bare.exit = originalExit
    else process.exit = originalExit
  })

  Pear.exit()

  const exitedRes = await exited
  t.is(exitedRes, true, 'Pear.exit ok')
})
