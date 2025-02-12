'use strict'

const { test } = require('brittle')
const path = require('path')

const dirname = __dirname

test('pear run pear pipe', async function ({ is, plan, teardown }) {
  plan(1)

  const dir = path.join(dirname, 'fixtures', 'run')

  const Worker = require('../worker')
  Worker.RUNTIME = Bare.argv[0]
  Worker.RUNTIME_ARGV = [dir]
  const worker = new Worker({ ref: () => undefined, unref: () => undefined })

  const ipc = {
    ref: () => undefined,
    unref: () => undefined
  }
  const state = {}
  const API = require('..')
  API.RTI = { checkout: { key: dirname, length: null, fork: null } }
  global.Pear = new API(ipc, state, { worker, teardown })

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

  const Worker = require('../worker')
  Worker.RUNTIME = Bare.argv[0]
  Worker.RUNTIME_ARGV = [dir]
  const worker = new Worker({ ref: () => undefined, unref: () => undefined })

  const ipc = {
    ref: () => undefined,
    unref: () => undefined
  }
  const state = {}
  const API = require('..')
  API.RTI = { checkout: { key: dirname, length: null, fork: null } }
  global.Pear = new API(ipc, state, { worker, teardown })

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
