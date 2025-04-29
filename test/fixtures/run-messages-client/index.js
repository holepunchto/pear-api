const Helper = require('../../helper')
const { isBare } = require('which-runtime')
const { isBare } = require('which-runtime')

const main = async () => {
  const ipc = await Helper.startIpcClient()

  Helper.rig({ ipc, state: { config: { args: isBare ? Bare.argv.slice(4) : process.argv.slice(4) } } })

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
  pipe.end()
}
main()
