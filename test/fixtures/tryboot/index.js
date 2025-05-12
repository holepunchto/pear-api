const Helper = require('../../helper')
const process = require('process')

Helper.rig({ state: { config: { args: process.argv.slice(4) } } })

let resolve = () => {}
const spawnCalled = new Promise((_resolve) => {
  resolve = _resolve
})
const teardown = Helper.override('child_process', {
  spawn: (cmd, args, options) => {
    resolve({ cmd, args, options })
    return { unref: () => {} }
  }
})
Pear.teardown(teardown)

const tryboot = require('../../../tryboot')
tryboot()

const pipe = Pear.pipe
pipe.on('data', async () => {
  const res = await spawnCalled
  pipe.write(JSON.stringify(res) + '\n')
})
