import '../../helper'
import Worker from '../../../worker'

const worker = new Worker({ ref: () => undefined, unref: () => undefined })

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
