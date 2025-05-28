const [entry] = Pear.config.args
const pipe = Pear.pipe
const childPipe = Pear.run(entry)
childPipe.on('data', (data) => {
  pipe.write(data)
  childPipe.end()
})
childPipe.write('start')
