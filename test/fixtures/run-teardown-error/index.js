const Helper = require('../../helper')

Helper.rig({ state: { config: { args: Bare.argv.slice(4) } } })

const pipe = Pear.pipe

Pear.teardown(async () => {
  throw new Error('teardown error')
})
