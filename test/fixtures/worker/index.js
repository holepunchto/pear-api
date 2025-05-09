const process = require('process')
const { pathToFileURL } = require('url-file-url')

const dirname = __dirname
global.Pear = null

const rig = () => {
  if (!require.main.url) require.main.url = pathToFileURL(__filename)
  if (global.Pear !== null) throw Error(`Prior Pear global not cleaned up: ${global.Pear}`)

  class RigAPI {
    static RTI = { checkout: { key: dirname, length: null, fork: null } }
  }
  global.Pear = new RigAPI()

  const Worker = require('../../../worker')
  const worker = new Worker()

  return {
    teardown: () => { global.Pear = null },
    worker
  }
}

const { worker } = rig()

const pipe = worker.pipe()

let i = 0
let interval = null
pipe.on('data', (data) => {
  const str = data.toString()
  if (str === 'ping') {
    interval = setInterval(() => pipe.write((i++).toString()), 500)
  }
  if (str === 'exit') {
    clearInterval(interval)
    process.exit()
  }
})
