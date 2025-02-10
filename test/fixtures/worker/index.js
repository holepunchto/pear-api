'use strict'

const dirname = __dirname

const rig = () => {
  class TestAPI {
    static RTI = { checkout: { key: dirname, length: null, fork: null } }
    static get CONSTANTS () { return require('../../../constants') }
    config = {}
  }
  global.Pear = new TestAPI()
}
rig()

const ipc = {
  ref: () => undefined,
  unref: () => undefined
}
const state = {}
const Worker = require('../../../worker')
Worker.RUNTIME = Bare.argv[0]
const worker = new Worker({ ref: () => undefined, unref: () => undefined })
const API = require('../../..')
global.Pear = new API(ipc, state, { worker })

const pipe = Pear.pipe

let i = 0
let interval = null
pipe.on('data', (data) => {
  const str = data.toString()
  if (str === 'ping') {
    interval = setInterval(() => pipe.write((i++).toString()), 2000)
  }
  if (str === 'exit') {
    clearInterval(interval)
    Pear.exit()
  }
})
