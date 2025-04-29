const Helper = require('../../helper')
const { isBare } = require('which-runtime')

Helper.rig({ state: { config: { args: isBare ? Bare.argv.slice(4) : process.argv.slice(4) } } })

const pipe = Pear.pipe
pipe.on('data', () => pipe.write(`${isBare ? Bare.pid : process.pid}\n`))

Pear.teardown(async () => {
  await new Promise((resolve) => {
    pipe.write('teardown\n', resolve)
  })
  Pear.exit(124)
})
