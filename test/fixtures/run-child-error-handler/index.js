const Helper = require('../../helper')
const process = require('process')

Helper.rig({ state: { config: { args: process.argv.slice(4) } } })

const pipe = Pear.pipe
pipe.on('error', (err) => {
  if (err.code === 'ENOTCONN') return // when the other side destroys the pipe
  throw err
})
pipe.write(`${process.pid}\n`)
