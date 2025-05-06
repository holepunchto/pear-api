const Helper = require('../../helper')
const process = require('process')

Helper.rig({ state: { config: { args: process.argv.slice(4) } } })

const pipe = Pear.pipe
pipe.on('data', () => pipe.write(`${process.pid}\n`))

Pear.teardown(async () => {
  await new Promise((resolve) => {
    pipe.write('teardown\n', resolve)
  })
  Pear.exit(124)
})
