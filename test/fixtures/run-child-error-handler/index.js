const Helper = require('../../helper')
const { isBare } = require('which-runtime')

Helper.rig({ state: { config: { args: isBare ? Bare.argv.slice(4) : process.argv.slice(4) } } })

const pipe = Pear.pipe
pipe.on('error', (err) => {
  if (err.code === 'ENOTCONN') return // when the other side destroys the pipe
  throw err
})
pipe.write(`${isBare ? Bare.pid : process.pid}\n`)
