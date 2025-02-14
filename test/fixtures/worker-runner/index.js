import Helper from '../../helper'

Helper.rig({ state: { config: { args: Bare.argv.slice(4) } } })

const pipe = Pear.pipe
const [workerPath] = Pear.config.args

Helper.rig({ state: { config: { args: Bare.argv.slice(4) } }, runtimeArgv: [workerPath] })

const workerPipe = Pear.run(workerPath)
workerPipe.on('data', (data) => {
  pipe.write(data)
  workerPipe.end()
})

workerPipe.write('start')
