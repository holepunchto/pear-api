'use strict'
const test = require('brittle')
const { command } = require('paparam')

// mock global.Pear
global.Pear = {
  constructor: {
    CHECKOUT: {
      length: null
    }
  }
}

const rundef = require('../cmd/run')
const State = require('../state')

test('new State with runtime info', async (t) => {
  t.plan(2)

  const run = command('run', ...rundef, runMain)
  run.parse([
    '--runtime-info', '{ "type": "bridge", "data": "http://localhost:1234" }',
    'pear://link'
  ])

  function runMain (cmd) {
    const state = new State({
      flags: cmd.flags,
      args: cmd.args
    })
    t.is(state.runtimeInfo.type, 'bridge')
    t.is(state.runtimeInfo.data, 'http://localhost:1234')
  }
})
