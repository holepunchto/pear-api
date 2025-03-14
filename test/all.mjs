// This runner is auto-generated by Brittle

runTests()

async function runTests () {
  const test = (await import('brittle')).default

  test.pause()

  await import('./cmd-pear.test.js')
  await import('./cmd-run.test.js')
  await import('./constants.test.js')
  await import('./crasher.test.js')
  await import('./errors.test.js')
  await import('./gunk.test.js')
  await import('./index.test.js')
  await import('./logger.test.js')
  await import('./parse-link.test.js')
  await import('./state.test.js')
  await import('./teardown.test.js')
  await import('./terminal.test.js')
  await import('./transform.test.js')
  await import('./tryboot.test.js')
  await import('./worker.test.js')

  test.resume()
}
