'use strict'

const { test } = require('brittle')
const { isWindows } = require('which-runtime')
const { pathToFileURL } = require('url-file-url')

const dirname = __dirname
global.Pear = null

const CONSTANTS_URL = pathToFileURL(require.resolve('../constants'))

const rig = (mount) => {
  if (global.Pear !== null) throw Error(`Prior Pear global not cleaned up: ${global.Pear}`)

  class RigAPI {
    static RTI = { checkout: { key: dirname, length: null, fork: null }, mount }
  }
  global.Pear = new RigAPI()

  return {
    teardown: () => {
      delete require.cache[CONSTANTS_URL]
      global.Pear = null
    }
  }
}

test('constants with CHECKOUT', async function (t) {
  t.plan(3)

  const { teardown } = rig()
  t.teardown(teardown)

  const constants = require('../constants')
  t.is(constants.CHECKOUT.key, dirname)
  t.is(constants.CHECKOUT.length, null)
  t.is(constants.CHECKOUT.fork, null)
})

test('constants with default MOUNT', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const constants = require('../constants')
  t.is(constants.MOUNT, pathToFileURL(dirname).href)
})

test('constants with MOUNT starting with c:/', async function (t) {
  t.plan(1)

  const { teardown } = rig('c:/custom/mount')
  t.teardown(teardown)

  const constants = require('../constants')
  t.is(constants.MOUNT, 'file:///c:/custom/mount')
})

test('constants with MOUNT starting with c:\\', async function (t) {
  t.plan(1)

  const { teardown } = rig('c:\\custom\\mount')
  t.teardown(teardown)

  const constants = require('../constants')
  t.is(constants.MOUNT, 'file:///c:/custom/mount')
})

test('constants with MOUNT starting with file:', { skip: isWindows }, async function (t) {
  t.plan(1)

  const { teardown } = rig('file:///custom/mount')
  t.teardown(teardown)

  const constants = require('../constants')
  t.is(constants.MOUNT, 'file:///custom/mount')
})

test('constants with MOUNT starting with ./', { skip: isWindows }, async function (t) {
  t.plan(1)

  const { teardown } = rig('./custom/mount')
  t.teardown(teardown)

  const constants = require('../constants')
  t.is(constants.MOUNT, 'file:///custom/mount')
})

test('constants with MOUNT starting with ../', { skip: isWindows }, async function (t) {
  t.plan(1)

  const { teardown } = rig('../custom/mount')
  t.teardown(teardown)

  const constants = require('../constants')
  t.is(constants.MOUNT, 'file:///custom/mount')
})

test('constants with MOUNT starting with /', { skip: isWindows }, async function (t) {
  t.plan(1)

  const { teardown } = rig('/custom/mount')
  t.teardown(teardown)

  const constants = require('../constants')
  t.is(constants.MOUNT, 'file:///custom/mount')
})

test('constants with MOUNT starting with pear://', async function (t) {
  t.plan(1)

  const { teardown } = rig('pear://custom/mount')
  t.teardown(teardown)

  t.exception(() => require('../constants'))
})
