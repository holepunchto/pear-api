const Helper = require('../../helper')
const process = require('process')

const teardown = Helper.rig({ state: { config: { args: process.argv.slice(4) } } })
const [entry] = Pear.config.args
teardown()

Helper.rig({ state: { config: { args: process.argv.slice(4) } }, runtimeArgv: [entry] })

const main = async () => {
  const pipeIn = Pear.pipe
  pipeIn.write(`${process.pid}\n`)

  const pipe = Pear.run(entry)
  pipe.on('end', () => pipe.end())

  const pid = await new Promise((resolve) => {
    pipe.on('data', (data) => resolve(data.toString()))
  })

  await Helper.untilExit(pid)
  pipeIn.end()
}
main()
