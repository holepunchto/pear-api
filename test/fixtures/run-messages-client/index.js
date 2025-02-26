const Helper = require('../../helper')

const main = async () => {
  const ipc = await Helper.startIpcClient()

  Helper.rig({ ipc, state: { config: { args: Bare.argv.slice(4) } } })

  const pipe = Pear.pipe

  const received = Helper.createLazyPromise()
  const receivedStream = Pear.messages({ hello: 'world' }, async (data) => {
    pipe.write(`${data.msg}\n`)
    received.resolve()
  })
  await received.promise

  await Helper.untilClose(receivedStream)
  pipe.end()
}
main()
