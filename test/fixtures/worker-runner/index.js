import Worker from '../../../worker'
import Helper from '../../helper'

Helper.rig({ state: { config: { args: Bare.argv.slice(4) } } })

const pipe = Pear.pipe
const [workerPath] = Pear.config.args

Worker.RUNTIME_ARGV = [workerPath]

const workerPipe = Pear.run(workerPath)
workerPipe.on('data', (data) => {
  pipe.write(data)
  workerPipe.end()
})

workerPipe.write('start')
