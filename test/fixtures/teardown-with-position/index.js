const pipe = Pear.pipe

Pear.teardown(async () => {
  await new Promise((resolve) => {
    pipe.write('teardown\n', resolve)
  })
}, 10) // lower position runs first

Pear.teardown(async () => {
  await new Promise((resolve) => {
    pipe.write('error\n', resolve)
  })
}, 100) // higher position runs later
