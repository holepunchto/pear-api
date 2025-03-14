'use strict'

const { test } = require('brittle')

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

test('terminal indicator', async function (t) {
  t.plan(4)

  const { teardown } = rig()
  t.teardown(teardown)

  const { indicator, ansi } = require('../terminal')
  t.ok(indicator() === '')
  t.ok(indicator(null) === ansi.gray('- '))
  t.ok(indicator(true) === ansi.tick + ' ')
  t.ok(indicator(false) === ansi.cross + ' ')
})

test('usage object structure', async function (t) {
  t.plan(4)

  const { teardown } = rig()
  t.teardown(teardown)

  const { usage } = require('../terminal')
  t.ok(typeof usage === 'object', 'usage should be an object')
  t.ok(typeof usage.header === 'string', 'usage.header should be a string')
  t.ok(typeof usage.version === 'string', 'usage.version should be a string')
  t.ok(typeof usage.footer === 'object', 'usage.footer should be an object')
})

test('usage.header content', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const { usage } = require('../terminal')
  t.ok(usage.header.includes('Welcome to the Internet of Peers'), 'usage.header should contain welcome message')
})

test('usage.version format', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const { usage } = require('../terminal')
  t.ok(usage.version === `0.dev.${dirname}`)
})

test('usage.footer content', async function (t) {
  t.plan(2)

  const { teardown } = rig()
  t.teardown(teardown)

  const { usage } = require('../terminal')
  t.ok(usage.footer.overview.includes('Legend'), 'usage.footer.overview should contain legend')
  t.ok(usage.footer.help.includes('Welcome to the IoP'), 'usage.footer.help should contain welcome message')
})
