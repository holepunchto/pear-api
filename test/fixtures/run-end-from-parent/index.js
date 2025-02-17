const Helper = require('../../helper')

const teardown = Helper.rig({ state: { config: { args: Bare.argv.slice(4) } } })
const [workerPath] = Pear.config.args
teardown()

Helper.rig({ state: { config: { args: Bare.argv.slice(4) } }, runtimeArgv: [workerPath] })

const main = async () => {
  const pipeIn = Pear.pipe
  pipeIn.write(`${Bare.pid}\n`)

  const pipe = Pear.run(workerPath)

  const pid = await new Promise((resolve) => {
    pipe.on('data', (data) => resolve(data.toString()))
  })
  pipe.end()

  await Helper.untilWorkerExit(pid)
  pipeIn.end()
}
main()
