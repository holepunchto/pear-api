const Helper = require('../../helper')
const { isBare } = require('which-runtime')

Helper.rig({ state: { config: { args: isBare ? Bare.argv.slice(4) : process.argv.slice(4) } } })

const main = async () => {
  const pipe = Pear.pipe
  pipe.write(`${isBare ? Bare.pid : process.pid}\n`)

  await new Promise((resolve) => setTimeout(resolve, 1000))
  pipe.end()
}
main()
