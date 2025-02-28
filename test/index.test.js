'use strict'

const { test } = require('brittle')
const { isWindows } = require('which-runtime')
const path = require('path')
const os = require('bare-os')
const Iambus = require('iambus')

const Helper = require('./helper')

const dirname = __dirname

//
// messages
//

test('messages single client', async function (t) {
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

  const subscribed = Helper.createLazyPromise()
  const received = Helper.createLazyPromise()
  const messages = []
  const stream = Pear.messages({ hello: 'world' }, (data) => {
    if (data.type === 'subscribed') {
      if (data.pattern.hello === 'world') {
        subscribed.resolve()
      }
      return
    }
    messages.push(data)
    if (messages.length === 4) {
      received.resolve()
    }
  })
  t.teardown(() => stream.destroy())

  await subscribed.promise
  await Pear.message({ hello: 'world' })

  await received.promise
  t.is(messages.length, 4, 'received 4 messages')
  t.ok(messages.every(msg => msg.hello === 'world'), 'all messages match')
  t.ok(messages.every(msg => typeof msg.time === 'number' && msg.time <= Date.now()), 'all messages have time')

  await Helper.untilClose(stream)
})

test('messages multi clients', async function (t) {
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

test('messages with no listener', async function (t) {
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

test('messages with function pattern', async function (t) {
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

  const subscribed = Helper.createLazyPromise()
  const received = Helper.createLazyPromise()
  const stream = Pear.messages((data) => {
    if (data.type === 'subscribed') {
      subscribed.resolve()
      return
    }
    received.resolve(data)
  })
  t.teardown(() => stream.destroy())

  await subscribed.promise
  await Pear.message({ hello: 'world' })

  const msg = await received.promise
  t.ok(msg.hello === 'world', 'message received')
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

  t.ok(Pear.config.hello === 'world', 'Pear.config is set')

  const cp = await Pear.checkpoint({ magic: 'trick' })
  t.ok(cp.magic === 'trick', 'checkpoint returned')
  t.ok(typeof cp.time === 'number' && cp.time <= Date.now(), 'checkpoint has time')

  t.ok(Pear.config.hello === 'world', 'Pear.config is still set')
  t.ok(Pear.config.checkpoint.magic === 'trick', 'Pear.config is updated')
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
  t.ok(ver.hello === 'world', 'versions returned')
  t.ok(typeof ver.time === 'number' && ver.time <= Date.now(), 'versions has time')
})

//
// run
//

test('Pear.run pipe', async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'run')

  const teardown = Helper.rig({ runtimeArgv: [dir] })
  t.teardown(teardown)

  const pipe = Pear.run(dir)

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

test('Pear.run should receive args from the parent', async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'print-args')

  const teardown = Helper.rig({ runtimeArgv: [dir] })
  t.teardown(teardown)

  const args = ['hello', 'world']
  const pipe = Pear.run(dir, args)

  const result = await Helper.untilResult(pipe)

  t.is(result, JSON.stringify(args), 'run should receive args from the parent')

  await Helper.untilClose(pipe)
})

test('Pear.run should run directly in a terminal app', async function (t) {
  t.plan(1)

  const runDir = path.join(dirname, 'fixtures', 'run-runner')
  const helloWorldDir = path.join(dirname, 'fixtures', 'hello-world')

  const teardown = Helper.rig({ runtimeArgv: [runDir] })
  t.teardown(teardown)

  const pipe = Pear.run(runDir, [helloWorldDir])

  const response = await Helper.untilResult(pipe)

  t.is(response, 'hello world', 'run should send expected response')

  await Helper.untilClose(pipe)
})

test('Pear.run exit when child calls pipe.end()', async function (t) {
  const runParent = path.join(dirname, 'fixtures', 'run-parent')
  const runEndFromChild = path.join(dirname, 'fixtures', 'run-end-from-child')

  const teardown = Helper.rig({ runtimeArgv: [runParent] })
  t.teardown(teardown)

  const pipe = await Pear.run(runParent, [runEndFromChild])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilExit(pid)
})

test('Pear.run exit when child calls pipe.destroy()', async function (t) {
  const runParentErrorHandler = path.join(dirname, 'fixtures', 'run-parent-error-handler')
  const runDestroyFromChild = path.join(dirname, 'fixtures', 'run-destroy-from-child')

  const teardown = Helper.rig({ runtimeArgv: [runParentErrorHandler] })
  t.teardown(teardown)

  const pipe = await Pear.run(runParentErrorHandler, [runDestroyFromChild])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilExit(pid)
})

test('Pear.run exit when parent calls pipe.end()', async function (t) {
  const runEndFromParent = path.join(dirname, 'fixtures', 'run-end-from-parent')
  const runChild = path.join(dirname, 'fixtures', 'run-child')

  const teardown = Helper.rig({ runtimeArgv: [runEndFromParent] })
  t.teardown(teardown)

  const pipe = await Pear.run(runEndFromParent, [runChild])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilExit(pid)
})

test('Pear.run exit when parent calls pipe.destroy()', async function (t) {
  const runDestroyFromParent = path.join(dirname, 'fixtures', 'run-destroy-from-parent')
  const runChildErrorHandler = path.join(dirname, 'fixtures', 'run-child-error-handler')

  const teardown = Helper.rig({ runtimeArgv: [runDestroyFromParent] })
  t.teardown(teardown)

  const pipe = await Pear.run(runDestroyFromParent, [runChildErrorHandler])
  const pid = await Helper.untilResult(pipe)
  await Helper.untilExit(pid)
})

//
// get
//

test('Pear.get returns', async function (t) {
  t.plan(3)

  await Helper.startIpcServer({
    handlers: {
      get: ({ key, ...opts }) => ({ key, ...opts, time: Date.now() })
    },
    teardown: t.teardown
  })
  const ipc = await Helper.startIpcClient()

  const teardown = Helper.rig({ ipc })
  t.teardown(teardown)

  const res = await Pear.get('hello', { magic: 'trick' })
  t.ok(res.key === 'hello', 'get returned')
  t.ok(res.magic === 'trick', 'get has data')
  t.ok(typeof res.time === 'number' && res.time <= Date.now(), 'versions has time')
})

//
// exists
//

test('Pear.exists returns', async function (t) {
  t.plan(2)

  await Helper.startIpcServer({
    handlers: {
      exists: ({ key }) => ({ key, time: Date.now() })
    },
    teardown: t.teardown
  })
  const ipc = await Helper.startIpcClient()

  const teardown = Helper.rig({ ipc })
  t.teardown(teardown)

  const res = await Pear.exists('hello')
  t.ok(res.key === 'hello', 'exists returned')
  t.ok(typeof res.time === 'number' && res.time <= Date.now(), 'versions has time')
})

//
// compare
//

test('Pear.compare returns', async function (t) {
  t.plan(4)

  await Helper.startIpcServer({
    handlers: {
      compare: ({ keyA, keyB }) => ({ keyA, keyB, check: keyA === keyB, time: Date.now() })
    },
    teardown: t.teardown
  })
  const ipc = await Helper.startIpcClient()

  const teardown = Helper.rig({ ipc })
  t.teardown(teardown)

  const res = await Pear.compare('hello', 'world')
  t.ok(res.keyA === 'hello', 'compare returned keyA')
  t.ok(res.keyB === 'world', 'compare returned keyB')
  t.ok(res.check === false, 'compare returned check')
  t.ok(typeof res.time === 'number' && res.time <= Date.now(), 'compare has time')
})

//
// restart
//

test('restart terminal app throw error', async function (t) {
  t.plan(1)

  const teardown = Helper.rig({ state: { ui: null } })
  t.teardown(teardown)

  t.exception(() => Pear.restart(), 'Pear.restart threw an error for terminal app')
})

test('restart ok', async function (t) {
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
  t.ok(res.hello === 'world', 'restart returned')
  t.ok(typeof res.time === 'number' && res.time <= Date.now(), 'restart has time')
})

//
// reload
//

test('reload terminal app throw error', async function (t) {
  t.plan(1)

  const teardown = Helper.rig({ state: { ui: null } })
  t.teardown(teardown)

  t.exception(() => Pear.reload(), 'Pear.reload threw an error for terminal app')
})

test('reload desktop app throw error', async function (t) {
  t.plan(1)

  const teardown = Helper.rig()
  t.teardown(teardown)

  t.exception(() => Pear.reload({ platform: 'darwin' }), 'Pear.reload threw an error for desktop app')
})

test('reload ok', async function (t) {
  t.plan(1)

  const teardown = Helper.rig()
  t.teardown(teardown)

  const reloaded = Helper.createLazyPromise()
  global.location = { reload: () => reloaded.resolve() }

  Pear.reload()

  await reloaded.promise
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

  const subscribed = Helper.createLazyPromise()
  const received = Helper.createLazyPromise()
  const stream = Pear.updates((data) => {
    if (data.type === 'subscribed') {
      if (data.pattern.type === 'pear/updates') {
        subscribed.resolve()
      }
      return
    }
    received.resolve(data)
  })
  t.teardown(() => stream.destroy())

  await subscribed.promise
  await Pear.message({ type: 'pear/updates', hello: 'world' })

  const msg = await received.promise
  t.ok(msg.type === 'pear/updates', 'updates triggered')
  t.ok(msg.hello === 'world', 'message received')
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

//
// teardown
//

test('teardown on pipe end', { skip: isWindows }, async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'run-teardown')

  const teardown = Helper.rig({ runtimeArgv: [dir] })
  t.teardown(teardown)

  const pipe = Pear.run(dir)

  const td = await Helper.untilResult(pipe, { runFn: () => pipe.end() })
  t.is(td, 'teardown', 'teardown executed')
})

test('teardown on os kill', { skip: isWindows }, async function (t) {
  t.plan(2)

  const dir = path.join(dirname, 'fixtures', 'run-teardown-os-kill')

  const teardown = Helper.rig({ runtimeArgv: [dir] })
  t.teardown(teardown)

  const pipe = Pear.run(dir)

  pipe.on('error', (err) => {
    if (err.code === 'ENOTCONN') return // when the other side destroys the pipe
    throw err
  })

  const pid = +(await Helper.untilResult(pipe))
  t.ok(pid > 0, 'worker pid is valid')

  const td = await Helper.untilResult(pipe, { runFn: () => os.kill(pid) })
  t.is(td, 'teardown', 'teardown executed')
})

test('teardown on os kill with exit code', { skip: isWindows }, async function (t) {
  t.plan(3)

  const dir = path.join(dirname, 'fixtures', 'run-teardown-exit-code')

  const teardown = Helper.rig({ runtimeArgv: [dir] })
  t.teardown(teardown)

  const pipe = Pear.run(dir)

  pipe.on('error', (err) => {
    if (err.code === 'ENOTCONN') return // when the other side destroys the pipe
    throw err
  })

  const pid = +(await Helper.untilResult(pipe))
  t.ok(pid > 0, 'worker pid is valid')

  const exitCodePromise = new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error('timed out')), 5000)
    pipe.on('crash', (data) => {
      clearTimeout(timeoutId)
      resolve(data.exitCode)
    })
  })

  const td = await Helper.untilResult(pipe, { runFn: () => os.kill(pid) })
  t.is(td, 'teardown', 'teardown executed')

  const exitCode = await exitCodePromise
  t.is(exitCode, 124, 'exit code matches')
})

test('teardown run wait', { skip: isWindows }, async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'run-teardown-wait')

  const teardown = Helper.rig({ runtimeArgv: [dir] })
  t.teardown(teardown)

  const pipe = Pear.run(dir)

  const td = await Helper.untilResult(pipe, { runFn: () => pipe.end() })
  t.is(td, 'teardown', 'teardown executed')
})

test('teardown throw error', { skip: isWindows }, async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'run-teardown-error')

  const teardown = Helper.rig({ runtimeArgv: [dir] })
  t.teardown(teardown)

  const pipe = Pear.run(dir)

  const td = await Helper.untilResult(pipe, { runFn: () => pipe.end() })
  t.is(td, 'teardown', 'teardown executed')
})
