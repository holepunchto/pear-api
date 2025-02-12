'use strict'

const dirname = __dirname

const ipc = {
  ref: () => undefined,
  unref: () => undefined
}
const state = {}
const API = require('../../..')
API.RTI = { checkout: { key: dirname, length: null, fork: null } }
global.Pear = new API(ipc, state)

const pipe = Pear.pipe

let i = 0
let interval = null
pipe.on('data', (data) => {
  const str = data.toString()
  if (str === 'ping') {
    interval = setInterval(() => pipe.write((i++).toString()), 500)
  }
  if (str === 'exit') {
    clearInterval(interval)
    Pear.exit()
  }
})
