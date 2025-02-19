'use strict'

const { isWindows } = require('which-runtime')
const { test } = require('brittle')
const path = require('path')

const Helper = require('./helper')

const dirname = __dirname

test('teardown on pipe end', { skip: isWindows }, async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'run-teardown')

  const teardown = Helper.rig({ runtimeArgv: [dir] })
  t.teardown(teardown)

  const pipe = Pear.run(dir)

  const td = await Helper.untilResult(pipe, { runFn: () => pipe.end() })
  t.is(td, 'teardown', 'teardown executed')
})
