const Helper = require('../../helper')
const process = require('process')

Helper.rig({ state: { config: { args: process.argv.slice(4) } } })

const pipe = Pear.pipe
pipe.on('data', () => {
  pipe.write('hello world\n')
})
