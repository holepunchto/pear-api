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

test('constants CHECKOUT', async function (t) {
  t.plan(3)

  const { teardown } = rig()
  t.teardown(teardown)

  const constants = require('../constants')
  t.ok(constants.CHECKOUT.key === dirname)
  t.ok(constants.CHECKOUT.length === null)
  t.ok(constants.CHECKOUT.fork === null)
})
