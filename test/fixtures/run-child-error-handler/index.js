const Helper = require('../../helper')

Helper.rig({ state: { config: { args: Bare.argv.slice(4) } } })

const pipe = Pear.pipe
pipe.on('error', (err) => {
  if (err.code === 'ENOTCONN') return // when the other side destroys the pipe
  throw err
})
pipe.write(`${Bare.pid}\n`)
