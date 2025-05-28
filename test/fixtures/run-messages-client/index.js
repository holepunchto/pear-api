const Helper = require('../../helper')
const process = require('process')

const main = async () => {
  const ipc = await Helper.startIpcClient()
  runRigTeardown()
  const teardown = Helper.rig({ ipc, state: { config: { args: process.argv.slice(4) } } })

  const pipe = Pear.pipe

  const stream = Pear.messages({ hello: 'world' })
  await new Promise((resolve) => {
    stream.on('data', (data) => {
      if (data.hello === 'world') {
        pipe.write(`${data.msg}\n`)
        resolve()
      }
    })
  })

  await Helper.untilClose(stream)
  teardown()
  pipe.end()
}
main()
