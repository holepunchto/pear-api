const Helper = require('../../helper')

let resolve = () => {}
const spawnCalled = new Promise((_resolve) => {
  resolve = _resolve
})
const restore = Helper.override('bare-daemon', {
  spawn: (cmd, args, options) => {
    resolve({ cmd, args, options })
    return { unref: () => {} }
  }
})
Pear.teardown(restore)

const tryboot = require('../../../tryboot')
tryboot()

const pipe = Pear.pipe
pipe.on('data', async () => {
  const res = await spawnCalled
  pipe.write(JSON.stringify(res) + '\n')
})
