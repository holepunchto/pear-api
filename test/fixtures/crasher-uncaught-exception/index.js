const Helper = require('../../helper')
const process = require('process')

Helper.rig({ state: { config: { args: process.argv.slice(4) } } })
const [swap] = Pear.config.args

const setupCrashHandlers = require('../../../crasher')
setupCrashHandlers('testProcess', swap, true)

const main = async () => {
  const pipe = Pear.pipe
  pipe.write(`${process.pid}\n`)

  await new Promise((resolve) => setTimeout(resolve, 1000))
  throw new Error('Test uncaught exception')
}
main()
