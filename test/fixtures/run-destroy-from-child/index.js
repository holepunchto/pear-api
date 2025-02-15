import Helper from '../../helper'

Helper.rig({ state: { config: { args: Bare.argv.slice(4) } } })

const pipe = Pear.pipe
pipe.write(`${Bare.pid}\n`)
await new Promise((resolve) => setTimeout(resolve, 1000))
pipe.destroy()
