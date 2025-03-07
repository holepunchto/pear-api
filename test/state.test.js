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

test('state', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')
  const state = new State({ flags: {} })

  state.update({ hello: 'world' })
  t.ok(state.hello === 'world')
})
