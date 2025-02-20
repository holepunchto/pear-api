const { isWindows } = require('which-runtime')
const { Client } = require('pear-ipc')
const Helper = require('../../helper')

const socketPath = isWindows ? '\\\\.\\pipe\\pear-api-test-ipc' : 'test.sock'

async function startIpcClient () {
  const client = new Client({
    socketPath,
    connect: true
  })
  await client.ready()
  return client
}

const main = async () => {
  const client = await startIpcClient()

  Helper.rig({ ipc: client, state: { config: { args: Bare.argv.slice(4) } } })

  const pipe = Pear.pipe

  Pear.messages({ type: 'broadcast', tag: 'hello' }, async (data) => {
    pipe.write(`${data.msg}\n`)
  })
}
main()
