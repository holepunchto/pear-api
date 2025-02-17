const Helper = require('../../helper')

Helper.rig({ state: { config: { args: Bare.argv.slice(4) } } })

const main = async () => {
  const pipe = Pear.pipe
  pipe.write(`${Bare.pid}\n`)
  await new Promise((resolve) => setTimeout(resolve, 1000))
  pipe.destroy()
}
main()
