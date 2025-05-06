const Helper = require('../../helper')
const process = require('process')

Helper.rig({ state: { config: { args: process.argv.slice(4) } } })

const main = async () => {
  const pipe = Pear.pipe

  Pear.teardown(() => new Promise((resolve) => { setTimeout(resolve, 1000) }))

  await Pear.teardown()
  pipe.write('teardown\n')
}
main()
