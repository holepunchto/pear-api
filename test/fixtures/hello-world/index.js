const pipe = Pear.pipe
pipe.on('data', () => {
  pipe.write('hello world\n')
})
