// This runner is auto-generated by Brittle

runTests()

async function runTests () {
  const test = (await import('brittle')).default

  test.pause()

  await import('./index.test.js')
  await import('./worker.test.js')

  test.resume()
}
