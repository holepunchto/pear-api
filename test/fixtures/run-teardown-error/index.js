const Helper = require('../../helper')
const process = require('process')

Helper.rig({ state: { config: { args: process.argv.slice(4) } } })

const pipe = Pear.pipe

Pear.teardown(async () => {
  await new Promise((resolve) => {
    pipe.write('teardown\n', resolve)
  })
  throw new Error('run-teardown-error')
})
