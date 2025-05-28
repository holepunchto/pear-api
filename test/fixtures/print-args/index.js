const pipe = Pear.pipe
pipe.on('data', () => {
  pipe.write(JSON.stringify(Pear.config.args) + '\n')
})
