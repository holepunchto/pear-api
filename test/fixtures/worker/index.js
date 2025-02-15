const dirname = __dirname

class RigAPI {
  static RTI = { checkout: { key: dirname, length: null, fork: null } }
}
global.Pear = new RigAPI()

const Worker = require('../../../worker')
const worker = new Worker()

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
    Bare.exit()
  }
})
