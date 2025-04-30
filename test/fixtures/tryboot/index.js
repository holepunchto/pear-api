const Helper = require('../../helper')
const { isBare } = require('which-runtime')

Helper.rig({ state: { config: { args: isBare ? Bare.argv.slice(4) : process.argv.slice(4) } } })

let resolve = () => {}
const spawnCalled = new Promise((_resolve) => {
  resolve = _resolve
})
const childProcess = require('child_process')
const originalSpawn = childProcess.spawn
childProcess.spawn = (cmd, args, options) => {
  resolve({ cmd, args, options })
  return { unref: () => {} }
}
Pear.teardown(() => { childProcess.spawn = originalSpawn })

const tryboot = require('../../../tryboot')
tryboot()

const pipe = Pear.pipe
pipe.on('data', async () => {
  const res = await spawnCalled
  pipe.write(JSON.stringify(res) + '\n')
})
