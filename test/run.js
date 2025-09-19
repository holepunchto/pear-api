const Helper = require('./helper')
const { command } = require('paparam')
const pear = require('pear-cmd')
const rundef = require('pear-cmd/run')
const program = global.Bare ?? global.process
const cmd = pear(program.argv.slice(2))
if (cmd.args.cmd !== 'run')
  throw Error('NOT A RUN COMMAND, MUST BE A RUN COMMAND')
const parser = command('run', ...rundef)
const run = parser.parse(cmd.rest)
global.runRigTeardown = Helper.rig({
  state: {
    applink: 'pear://keet',
    config: { args: run.rest, applink: 'pear://keet' }
  }
})
require(run.args.link)
