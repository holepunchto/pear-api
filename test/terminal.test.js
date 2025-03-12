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
