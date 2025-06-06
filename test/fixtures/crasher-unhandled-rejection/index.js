const process = require('process')

const [swap] = Pear.config.args

const setupCrashHandlers = require('../../../crasher')
setupCrashHandlers('testProcess', swap, true)

const main = async () => {
  const pipe = Pear.pipe
  pipe.write(`${process.pid}\n`)

  await new Promise((resolve) => setTimeout(resolve, 1000))
  await new Promise((resolve, reject) => reject(new Error('Test unhandled rejection')))
}
main()
