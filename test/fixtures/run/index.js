'use strict'

const Helper = require('../../helper')
Helper.rig()

const dirname = __dirname

const Worker = require('../../../worker')
Worker.RUNTIME = Bare.argv[0]
const worker = new Worker({ ref: () => undefined, unref: () => undefined })

const ipc = {
  ref: () => undefined,
  unref: () => undefined
}
const state = {}
const API = require('../../..')
API.RTI = { checkout: { key: dirname, length: null, fork: null } }
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
