'use strict'

const { test } = require('brittle')
const { isWindows } = require('which-runtime')
// TODO: fix tests for windows

const dirname = __dirname
global.Pear = null

test('constants with CHECKOUT', async function (t) {
  t.plan(3)

  const rig = () => {
    if (global.Pear !== null) throw Error(`Prior Pear global not cleaned up: ${global.Pear}`)

    class RigAPI {
      static RTI = { checkout: { key: dirname, length: null, fork: null } }
    }
    global.Pear = new RigAPI()

    return {
      teardown: () => {
        delete require.cache[`file://${require.resolve('../constants')}`]
        global.Pear = null
      }
    }
  }

  const { teardown } = rig()
  t.teardown(teardown)

  const constants = require('../constants')
  t.ok(constants.CHECKOUT.key === dirname)
  t.ok(constants.CHECKOUT.length === null)
  t.ok(constants.CHECKOUT.fork === null)
})

test('constants with default MOUNT', { skip: isWindows }, async function (t) {
  t.plan(1)

  const rig = () => {
    if (global.Pear !== null) throw Error(`Prior Pear global not cleaned up: ${global.Pear}`)

    class RigAPI {
      static RTI = { checkout: { key: dirname, length: null, fork: null } }
    }
    global.Pear = new RigAPI()

    return {
      teardown: () => {
        delete require.cache[`file://${require.resolve('../constants')}`]
        global.Pear = null
      }
    }
  }

  const { teardown } = rig()
  t.teardown(teardown)

  const constants = require('../constants')
  t.ok(constants.MOUNT === `file://${dirname}`)
})

test('constants with MOUNT starting with c:', { skip: isWindows }, async function (t) {
  t.plan(1)

  const rig = () => {
    if (global.Pear !== null) throw Error(`Prior Pear global not cleaned up: ${global.Pear}`)

    class RigAPI {
      static RTI = { checkout: { key: dirname, length: null, fork: null }, mount: 'c:/custom/mount' }
    }
    global.Pear = new RigAPI()

    return {
      teardown: () => {
        delete require.cache[`file://${require.resolve('../constants')}`]
        global.Pear = null
      }
    }
  }

  const { teardown } = rig()
  t.teardown(teardown)

  const constants = require('../constants')
  t.ok(constants.MOUNT === 'file:///c:/custom/mount')
})

test('constants with MOUNT starting with file:', { skip: isWindows }, async function (t) {
  t.plan(1)

  const rig = () => {
    if (global.Pear !== null) throw Error(`Prior Pear global not cleaned up: ${global.Pear}`)

    class RigAPI {
      static RTI = { checkout: { key: dirname, length: null, fork: null }, mount: 'file:///custom/mount' }
    }
    global.Pear = new RigAPI()

    return {
      teardown: () => {
        delete require.cache[`file://${require.resolve('../constants')}`]
        global.Pear = null
      }
    }
  }

  const { teardown } = rig()
  t.teardown(teardown)

  const constants = require('../constants')
  t.ok(constants.MOUNT === 'file:///custom/mount')
})

test('constants with MOUNT starting with ./', { skip: isWindows }, async function (t) {
  t.plan(1)

  const rig = () => {
    if (global.Pear !== null) throw Error(`Prior Pear global not cleaned up: ${global.Pear}`)

    class RigAPI {
      static RTI = { checkout: { key: dirname, length: null, fork: null }, mount: './custom/mount' }
    }
    global.Pear = new RigAPI()

    return {
      teardown: () => {
        delete require.cache[`file://${require.resolve('../constants')}`]
        global.Pear = null
      }
    }
  }

  const { teardown } = rig()
  t.teardown(teardown)

  const constants = require('../constants')
  t.ok(constants.MOUNT === 'file:///custom/mount')
})

test('constants with MOUNT starting with ../', { skip: isWindows }, async function (t) {
  t.plan(1)

  const rig = () => {
    if (global.Pear !== null) throw Error(`Prior Pear global not cleaned up: ${global.Pear}`)

    class RigAPI {
      static RTI = { checkout: { key: dirname, length: null, fork: null }, mount: '../custom/mount' }
    }
    global.Pear = new RigAPI()

    return {
      teardown: () => {
        delete require.cache[`file://${require.resolve('../constants')}`]
        global.Pear = null
      }
    }
  }

  const { teardown } = rig()
  t.teardown(teardown)

  const constants = require('../constants')
  t.ok(constants.MOUNT === 'file:///custom/mount')
})

test('constants with MOUNT starting with /', { skip: isWindows }, async function (t) {
  t.plan(1)

  const rig = () => {
    if (global.Pear !== null) throw Error(`Prior Pear global not cleaned up: ${global.Pear}`)

    class RigAPI {
      static RTI = { checkout: { key: dirname, length: null, fork: null }, mount: '/custom/mount' }
    }
    global.Pear = new RigAPI()

    return {
      teardown: () => {
        delete require.cache[`file://${require.resolve('../constants')}`]
        global.Pear = null
      }
    }
  }

  const { teardown } = rig()
  t.teardown(teardown)

  const constants = require('../constants')
  t.ok(constants.MOUNT === 'file:///custom/mount')
})

test('constants with MOUNT starting with pear://', { skip: isWindows }, async function (t) {
  t.plan(1)

  const rig = () => {
    if (global.Pear !== null) throw Error(`Prior Pear global not cleaned up: ${global.Pear}`)

    class RigAPI {
      static RTI = { checkout: { key: dirname, length: null, fork: null }, mount: 'pear://custom/mount' }
    }
    global.Pear = new RigAPI()

    return {
      teardown: () => {
        delete require.cache[`file://${require.resolve('../constants')}`]
        global.Pear = null
      }
    }
  }

  const { teardown } = rig()
  t.teardown(teardown)

  t.exception(() => require('../constants'))
})
