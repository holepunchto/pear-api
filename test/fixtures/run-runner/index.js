const Helper = require('../../helper')

const teardown = Helper.rig({ state: { config: { args: Bare.argv.slice(4) } } })
const [entry] = Pear.config.args
teardown()

Helper.rig({ state: { config: { args: Bare.argv.slice(4) } }, runtimeArgv: [entry] })

const pipe = Pear.pipe

const workerPipe = Pear.run(entry)
workerPipe.on('data', (data) => {
  pipe.write(data)
  workerPipe.end()
})

workerPipe.write('start')
