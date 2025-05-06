const Helper = require('../../helper')
const process = require('process')

const teardown = Helper.rig({ state: { config: { args: process.argv.slice(4) } } })
const [entry] = Pear.config.args
teardown()

Helper.rig({ state: { config: { args: process.argv.slice(4) } }, runtimeArgv: [entry] })

const pipe = Pear.pipe

const childPipe = Pear.run(entry)
childPipe.on('data', (data) => {
  pipe.write(data)
  childPipe.end()
})

childPipe.write('start')
