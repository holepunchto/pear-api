const Helper = require('../../helper')

Helper.rig({ state: { config: { args: Bare.argv.slice(4) } } })

const pipe = Pear.pipe
pipe.on('data', () => {
  pipe.write(JSON.stringify(Pear.config.args) + '\n')
})
