const process = require('process')
const [swap] = Pear.config.args

const setupCrashHandlers = require('../../../crasher')
setupCrashHandlers('testProcess', swap, true)

const main = async () => {
  const pipe = require('pear-pipe')()
  pipe.write(`${process.pid}\n`)

  await new Promise((resolve) => setTimeout(resolve, 1000))
  throw new Error('Test uncaught exception')
}
main()
