const process = require('process')

const main = async () => {
  const pipe = Pear.pipe
  pipe.write(`${process.pid}\n`)

  await new Promise((resolve) => setTimeout(resolve, 1000))
  pipe.end()
}
main()
