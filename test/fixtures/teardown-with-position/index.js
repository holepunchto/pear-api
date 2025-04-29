const Helper = require('../../helper')
const { isBare } = require('which-runtime')

Helper.rig({ state: { config: { args: isBare ? Bare.argv.slice(4) : process.argv.slice(4) } } })

const teardown = require('../../../teardown')

const pipe = Pear.pipe

teardown(async () => {
  await new Promise((resolve) => {
    pipe.write('teardown\n', resolve)
  })
}, 10) // lower position runs first

teardown(async () => {
  await new Promise((resolve) => {
    pipe.write('error\n', resolve)
  })
}, 100) // higher position runs later
