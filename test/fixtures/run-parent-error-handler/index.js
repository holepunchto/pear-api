const Helper = require('../../helper')
const process = require('process')

const [entry] = Pear.config.args

const main = async () => {
  const pipeIn = Pear.pipe
  pipeIn.write(`${process.pid}\n`)

  const pipe = Pear.run(entry)

  pipe.on('error', (err) => {
    if (err.code === 'ENOTCONN') return // when the other side destroys the pipe
    throw err
  })
  const pid = await new Promise((resolve) => {
    pipe.on('data', (data) => resolve(data.toString()))
  })

  await Helper.untilExit(pid)
  pipeIn.end()
}
main()
