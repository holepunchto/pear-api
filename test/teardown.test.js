'use strict'

const { test } = require('brittle')
const { isWindows, isBare } = require('which-runtime')
const path = require(isBare ? 'bare-path' : 'path')

const Helper = require('./helper')

const dirname = __dirname

test('teardown default', { skip: !isBare || isWindows }, async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'teardown-default')

  const teardown = Helper.rig({ runtimeArgv: [dir], clearRequireCache: '../teardown' })
  t.teardown(teardown)

  const pipe = Pear.run(dir)

  const td = await Helper.untilResult(pipe, { runFn: () => pipe.end() })
  t.is(td, 'teardown', 'teardown executed')
})

test('teardown with position', { skip: !isBare || isWindows }, async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'teardown-with-position')

  const teardown = Helper.rig({ runtimeArgv: [dir], clearRequireCache: '../teardown' })
  t.teardown(teardown)

  const pipe = Pear.run(dir)

  const td = await Helper.untilResult(pipe, { runFn: () => pipe.end() })
  t.is(td, 'teardown', 'teardown executed')
})
