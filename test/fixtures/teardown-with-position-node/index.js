const pipe = Pear.pipe

Pear.teardown(async () => {
  await pipe.write('ping2')
}, 100) // higher position runs later

Pear.teardown(async () => {
  pipe.write('ping1')
}, 10) // lower position runs first

Pear.exit()
