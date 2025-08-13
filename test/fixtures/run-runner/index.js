const [entry] = Pear.config.args
const pipe = require('pear-pipe')()
const run = require('pear-run')
const childPipe = run(entry)
childPipe.on('data', (data) => {
  pipe.write(data)
  childPipe.end()
})
childPipe.write('start')
