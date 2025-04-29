const { pathToFileURL } = require('url-file-url')

const CHILD_PROCESS_URL = pathToFileURL(require.resolve('child_process'))

const Helper = require('../../helper')
const { isBare } = require('which-runtime')

Helper.rig({ state: { config: { args: isBare ? Bare.argv.slice(4) : process.argv.slice(4) } } })

let resolve = () => {}
const spawnCalled = new Promise((_resolve) => {
  resolve = _resolve
})
const childProcess = require('child_process')
const originalSpawn = childProcess.spawn
require.cache[CHILD_PROCESS_URL].exports.spawn = (cmd, args, options) => {
  resolve({ cmd, args, options })
  return { unref: () => {} }
}
Pear.teardown(() => { require.cache[CHILD_PROCESS_URL].exports.spawn = originalSpawn })

const tryboot = require('../../../tryboot')
tryboot()

const pipe = Pear.pipe
pipe.on('data', async () => {
  const res = await spawnCalled
  pipe.write(JSON.stringify(res) + '\n')
})
