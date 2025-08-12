const process = require('process')

const pipe = require('pear-pipe')()
pipe.on('data', () => pipe.write(`${process.pid}\n`))

Pear.teardown(async () => {
  await new Promise((resolve) => {
    pipe.write('teardown\n', resolve)
  })
})
