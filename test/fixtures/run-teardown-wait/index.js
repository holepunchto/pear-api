const main = async () => {
  const pipe = Pear.pipe

  Pear.teardown(() => new Promise((resolve) => { setTimeout(resolve, 1000) }))

  await Pear.teardown()
  pipe.write('teardown\n')
}
main()
