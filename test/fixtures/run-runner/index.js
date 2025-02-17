const Helper = require('../../helper')

const teardown = Helper.rig({ state: { config: { args: Bare.argv.slice(4) } } })
const [workerPath] = Pear.config.args
teardown()

Helper.rig({ state: { config: { args: Bare.argv.slice(4) } }, runtimeArgv: [workerPath] })

const pipe = Pear.pipe

const workerPipe = Pear.run(workerPath)
workerPipe.on('data', (data) => {
  pipe.write(data)
  workerPipe.end()
})

workerPipe.write('start')
