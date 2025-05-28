const process = require('process')

const pipe = Pear.pipe
pipe.on('error', (err) => {
  if (err.code === 'ENOTCONN') return // when the other side destroys the pipe
  throw err
})
pipe.write(`${process.pid}\n`)
