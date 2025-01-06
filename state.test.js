const test = require('brittle')
const { command } = require('paparam')
const rundef = require('./cmd/run')
const State = require('./state')


test('new State with runtime info', async (t) => {
  t.plan(2)

  const info = `{ "type": "bridge", "data": "http://localhost:1234" }`
  const argv = ['--runtime-info', info]
  const run = command('run', ...rundef, runMain)
  run.parse(argv)

  function runMain (cmd) {
    const state = new State({
      link: cmd.args.link.replace('_||', '://'), // for Windows
      flags: cmd.flags,
      args: cmd.rest
    })

    t.is(state.runtimeInfo.type, 'bridge')
    t.is(state.runtimeInfo.data, 'http://localhost:1234')
  }
})
