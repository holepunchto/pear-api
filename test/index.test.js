'use strict'

const { test } = require('brittle')
const path = require('path')

const Worker = require('../worker')
const Helper = require('./helper')

Helper.rig()

const dirname = __dirname

test('pear run pear pipe', async function ({ is, plan, teardown }) {
  plan(1)

  const dir = path.join(dirname, 'fixtures', 'run')
  Worker.RUNTIME_ARGV = [dir]

  const pipe = Pear.run(dir)

  pipe.on('error', (err) => {
    if (err.code === 'ENOTCONN') return
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

  const workerResponse = await response
  is(workerResponse, '0123', 'pear pipe can send and receive data')

  pipe.write('exit')
})

test('pear run worker pipe', async function ({ is, plan, teardown }) {
  plan(1)

  const dir = path.join(dirname, 'fixtures', 'worker')
  Worker.RUNTIME_ARGV = [dir]

  const pipe = Pear.run(dir)

  pipe.on('error', (err) => {
    if (err.code === 'ENOTCONN') return
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

  const workerResponse = await response
  is(workerResponse, '0123', 'worker pipe can send and receive data')

  pipe.write('exit')
})

test('worker should receive args from the parent', async function ({ is, plan, teardown }) {
  plan(1)

  const dir = path.join(dirname, 'fixtures', 'print-args')
  Worker.RUNTIME_ARGV = [dir]

  const args = ['hello', 'world']
  const pipe = Pear.run(dir, args)

  const result = await Helper.untilResult(pipe)

  is(result, JSON.stringify(args), 'worker should receive args from the parent')

  await Helper.untilClose(pipe)
})

test('worker should run directly in a terminal app', async function ({ is, plan, comment, teardown }) {
  plan(1)

  const runDir = path.join(dirname, 'fixtures', 'worker-runner')
  const helloWorldDir = path.join(dirname, 'fixtures', 'hello-world')

  Worker.RUNTIME_ARGV = [runDir]

  comment('Running worker using worker-runner...')
  const pipe = Pear.run(runDir, [helloWorldDir])

  const response = await Helper.untilResult(pipe)

  is(response, 'hello world', 'worker should send expected response')

  await Helper.untilClose(pipe)
})

// test('worker should run as a link in a terminal app', async function ({ is, plan, comment, teardown }) {
//   plan(1)

//   const helper = new Helper()
//   teardown(() => helper.close(), { order: Infinity })
//   await helper.ready()

//   const testId = Math.floor(Math.random() * 100000)
//   comment('Staging worker-runner...')
//   const staging1 = helper.stage({ channel: `test-${testId}`, name: `test-${testId}`, key: null, dir: workerRunner, cmdArgs: [], dryRun: false, ignore: [] })
//   teardown(() => Helper.teardownStream(staging1))
//   const until1 = await Helper.pick(staging1, [{ tag: 'staging' }, { tag: 'final' }])
//   const { link: runnerLink } = await until1.staging
//   await until1.final

//   comment('Staging worker...')
//   const staging2 = helper.stage({ channel: `test-worker-${testId}`, name: `test-worker-${testId}`, key: null, dir: helloWorld, cmdArgs: [], dryRun: false, ignore: [] })
//   teardown(() => Helper.teardownStream(staging2))
//   const until2 = await Helper.pick(staging2, [{ tag: 'staging' }, { tag: 'final' }])
//   const { link: workerLink } = await until2.staging
//   await until2.final

//   comment('Running worker using worker-runner...')
//   const { pipe } = await Helper.run({ link: runnerLink, args: [workerLink] })
//   const response = await Helper.untilResult(pipe)

//   is(response, 'hello world', 'worker should send expected response')

//   await Helper.untilClose(pipe)
// })

// test('worker exit when child calls pipe.end()', async function () {
//   const pipe = await Pear.run(workerParent, [workerEndFromChild])
//   const pid = await Helper.untilResult(pipe)
//   await Helper.untilWorkerExit(pid)
// })

// test('worker exit when child calls pipe.destroy()', async function () {
//   const pipe = await Pear.run(workerParentErrorHandler, [workerDestroyFromChild])
//   const pid = await Helper.untilResult(pipe)
//   await Helper.untilWorkerExit(pid)
// })

// test('worker exit when parent calls pipe.end()', async function () {
//   const pipe = await Pear.run(workerEndFromParent, [workerChild])
//   const pid = await Helper.untilResult(pipe)
//   await Helper.untilWorkerExit(pid)
// })

// test('worker exit when parent calls pipe.destroy()', async function () {
//   const pipe = await Pear.run(workerDestroyFromParent, [workerChildErrorHandler])
//   const pid = await Helper.untilResult(pipe)
//   await Helper.untilWorkerExit(pid)
// })
