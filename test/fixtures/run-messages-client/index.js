const Helper = require('../../helper')

const main = async () => {
  const ipc = await Helper.startIpcClient()

  Helper.rig({ ipc, state: { config: { args: Bare.argv.slice(4) } } })

  const pipe = Pear.pipe

  const lazyPromise = Helper.createLazyPromise()
  const sub = Pear.messages({ type: 'broadcast', tag: 'hello' }, async (data) => {
    pipe.write(`${data.msg}\n`)
    lazyPromise.resolve()
  })
  await lazyPromise.promise

  await Helper.untilClose(sub)
  pipe.end()
}
main()
