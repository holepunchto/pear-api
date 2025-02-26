const Helper = require('../../helper')

Helper.rig({ state: { config: { args: Bare.argv.slice(4) } } })

const pipe = Pear.pipe

Pear.teardown(async () => {
  try {
    throw new Error('teardown error')
  } catch (err) {
    await new Promise((resolve) => {
      pipe.write('teardown\n', resolve)
    })
    throw err
  }
})
