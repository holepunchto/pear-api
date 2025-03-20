'use strict'

const { test } = require('brittle')
const { pathToFileURL } = require('url-file-url')
const hypercoreid = require('hypercore-id-encoding')

const dirname = __dirname
global.Pear = null

const rig = () => {
  if (global.Pear !== null) throw Error(`Prior Pear global not cleaned up: ${global.Pear}`)

  class RigAPI {
    static RTI = { checkout: { key: dirname, length: null, fork: null } }
  }
  global.Pear = new RigAPI()

  return {
    teardown: () => { global.Pear = null }
  }
}

test('indicator function', async function (t) {
  t.plan(6)

  const { teardown } = rig()
  t.teardown(teardown)

  const { indicator, ansi } = require('../terminal')

  t.is(indicator(true), ansi.tick + ' ', 'indicator should return tick for true')
  t.is(indicator(false), ansi.cross + ' ', 'indicator should return cross for false')
  t.is(indicator(null), ansi.gray('- '), 'indicator should return gray dash for null')
  t.is(indicator(1), ansi.tick + ' ', 'indicator should return tick for positive number')
  t.is(indicator(-1), ansi.cross + ' ', 'indicator should return cross for negative number')
  t.is(indicator(0), ansi.gray('- '), 'indicator should return gray dash for zero')
})

test('status function', async function (t) {
  t.plan(3)

  const { teardown } = rig()
  t.teardown(teardown)

  const { status, stdio, ansi } = require('../terminal')

  const originalWrite = stdio.out.write
  let output = ''
  stdio.out.write = (str) => { output += str }

  status('Test message', true)
  t.ok(output.includes(ansi.tick + ' Test message'), 'status should print success message correctly')

  output = ''
  status('Test message', false)
  t.ok(output.includes(ansi.cross + ' Test message'), 'status should print failure message correctly')

  output = ''
  status('Test message')
  t.ok(output.includes('Test message'), 'status should print message without success indicator')

  stdio.out.write = originalWrite
})

test('print function', async function (t) {
  t.plan(3)

  const { teardown } = rig()
  t.teardown(teardown)

  const { print, ansi } = require('../terminal')

  const originalConsoleLog = console.log
  let output = ''
  console.log = (str) => { output += str }
  t.teardown(() => { console.log = originalConsoleLog })

  print('Test message', true)
  t.ok(output.includes(ansi.tick + ' Test message'), 'print should print success message correctly')

  output = ''
  print('Test message', false)
  t.ok(output.includes(ansi.cross + ' Test message'), 'print should print failure message correctly')

  output = ''
  print('Test message')
  t.ok(output.includes('Test message'), 'print should print message without success indicator')
})

test('confirm function with valid input', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const { stdio, ansi, confirm } = require('../terminal')

  const mockCreateInterface = () => ({
    _prompt: '',
    once: (event, callback) => {
      if (event === 'data') {
        setTimeout(() => callback(Buffer.from('YES\n')), 10)
      }
    },
    on: () => {},
    off: () => {},
    input: { setMode: () => {} },
    close: () => {}
  })
  const originalCreateInterface = require.cache[pathToFileURL(require.resolve('bare-readline'))].exports.createInterface
  require.cache[pathToFileURL(require.resolve('bare-readline'))].exports.createInterface = mockCreateInterface
  t.teardown(() => { require.cache[pathToFileURL(require.resolve('bare-readline'))].exports.createInterface = originalCreateInterface })

  let output = ''
  const originalWrite = stdio.out.write
  stdio.out.write = (str) => { output += str }
  t.teardown(() => { stdio.out.write = originalWrite })

  const dialog = `${ansi.warning} Are you sure you want to proceed?`
  const ask = 'Type YES to confirm'
  const delim = ':'
  const validation = (value) => value === 'YES'
  const msg = 'Invalid input. Please type YES to confirm.'

  await confirm(dialog, ask, delim, validation, msg)
  t.ok(output.includes('YES'), 'confirm should accept valid input')
})

test('confirm function with invalid input', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const { stdio, ansi, confirm } = require('../terminal')

  const mockCreateInterface = () => ({
    _prompt: '',
    once: (event, callback) => {
      if (event === 'data') {
        setTimeout(() => callback(Buffer.from('NO\n')), 10)
      }
    },
    on: () => {},
    off: () => {},
    input: { setMode: () => {} },
    close: () => {}
  })
  const originalCreateInterface = require.cache[pathToFileURL(require.resolve('bare-readline'))].exports.createInterface
  require.cache[pathToFileURL(require.resolve('bare-readline'))].exports.createInterface = mockCreateInterface
  t.teardown(() => { require.cache[pathToFileURL(require.resolve('bare-readline'))].exports.createInterface = originalCreateInterface })

  let output = ''
  const originalWrite = stdio.out.write
  stdio.out.write = (str) => {
    output += str
    if (str.includes('Invalid input')) throw Error('Invalid input')
  }
  t.teardown(() => { stdio.out.write = originalWrite })

  const dialog = `${ansi.warning} Are you sure you want to proceed?`
  const ask = 'Type YES to confirm'
  const delim = ':'
  const validation = (value) => value === 'YES'
  const msg = 'Invalid input. Please type YES to confirm.'

  try {
    await confirm(dialog, ask, delim, validation, msg)
  } catch {
    t.ok(output.includes('Invalid input'), 'confirm should reject invalid input')
  }
})

test('permit function with unencrypted key', async function (t) {
  t.plan(4)

  const { teardown } = rig()
  t.teardown(teardown)

  const { ansi, permit } = require('../terminal')

  const mockCreateInterface = () => ({
    _prompt: '',
    once: (event, callback) => {
      if (event === 'data') {
        setTimeout(() => callback(Buffer.from('TRUST\n')), 10)
      }
    },
    on: () => {},
    off: () => {},
    input: { setMode: () => {} },
    close: () => {}
  })
  const originalCreateInterface = require.cache[pathToFileURL(require.resolve('bare-readline'))].exports.createInterface
  require.cache[pathToFileURL(require.resolve('bare-readline'))].exports.createInterface = mockCreateInterface
  t.teardown(() => { require.cache[pathToFileURL(require.resolve('bare-readline'))].exports.createInterface = originalCreateInterface })

  const originalBareExit = Bare.exit
  const exited = new Promise((resolve) => { Bare.exit = () => resolve(true) })
  t.teardown(() => { Bare.exit = originalBareExit })

  let output = ''
  const originalConsoleLog = console.log
  console.log = (str) => { output += str }
  t.teardown(() => { console.log = originalConsoleLog })

  const mockKey = hypercoreid.decode('d47c1dfecec0f74a067985d2f8d7d9ad15f9ae5ff648f7bc6ca28e41d70ed221')
  const mockIpc = {
    permit: async ({ key }) => {
      t.is(key, mockKey, 'permit should call ipc.permit with the correct key')
    },
    close: async () => {
      t.pass('ipc.close should be called')
    }
  }
  const mockInfo = { key: mockKey, encrypted: false }
  const mockCmd = 'run'

  await permit(mockIpc, mockInfo, mockCmd)
  t.ok(output.includes(`${ansi.tick} pear://${hypercoreid.encode(mockKey)} is now trusted`), 'permit should print trust confirmation message')

  const exitedRes = await exited
  t.ok(exitedRes === true, 'Pear.exit ok')
})

test('permit function with encrypted key', async function (t) {
  t.plan(5)

  const { teardown } = rig()
  t.teardown(teardown)

  const { ansi, permit } = require('../terminal')

  const mockPassword = 'MYPASSWORD'

  const mockCreateInterface = () => ({
    _prompt: '',
    once: (event, callback) => {
      if (event === 'data') {
        setTimeout(() => callback(Buffer.from(`${mockPassword}\n`)), 10)
      }
    },
    on: () => {},
    off: () => {},
    input: { setMode: () => {} },
    close: () => {}
  })
  const originalCreateInterface = require.cache[pathToFileURL(require.resolve('bare-readline'))].exports.createInterface
  require.cache[pathToFileURL(require.resolve('bare-readline'))].exports.createInterface = mockCreateInterface
  t.teardown(() => { require.cache[pathToFileURL(require.resolve('bare-readline'))].exports.createInterface = originalCreateInterface })

  const originalBareExit = Bare.exit
  const exited = new Promise((resolve) => { Bare.exit = () => resolve(true) })
  t.teardown(() => { Bare.exit = originalBareExit })

  let output = ''
  const originalConsoleLog = console.log
  console.log = (str) => { output += str }
  t.teardown(() => { console.log = originalConsoleLog })

  const mockKey = hypercoreid.decode('d47c1dfecec0f74a067985d2f8d7d9ad15f9ae5ff648f7bc6ca28e41d70ed221')
  const mockIpc = {
    permit: async ({ key, password }) => {
      t.is(key, mockKey, 'permit should call ipc.permit with the correct key')
      t.is(password, mockPassword, 'permit should call ipc.permit with the correct password')
    },
    close: async () => {
      t.pass('ipc.close should be called')
    }
  }
  const mockInfo = { key: mockKey, encrypted: true }
  const mockCmd = 'run'
  const mockInteract = {
    run: async () => ({ value: mockPassword })
  }

  const originalInteract = require.cache[pathToFileURL(require.resolve('../terminal'))].exports.Interact
  require.cache[pathToFileURL(require.resolve('../terminal'))].exports.Interact = function () { return mockInteract }
  t.teardown(() => { require.cache[pathToFileURL(require.resolve('../terminal'))].exports.Interact = originalInteract })

  await permit(mockIpc, mockInfo, mockCmd)
  t.ok(output.includes(`${ansi.tick} Added encryption key for pear://${hypercoreid.encode(mockKey)}`), 'permit should print encryption confirmation message')

  const exitedRes = await exited
  t.ok(exitedRes === true, 'Pear.exit ok')
})
