'use strict'

const { test } = require('brittle')
const { isWindows, isBare } = require('which-runtime')
const path = require('path')

const Helper = require('./helper')

const dirname = __dirname

test('teardown default', { skip: !isBare || isWindows }, async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'teardown-default')

  const teardown = Helper.rig({ clearRequireCache: '../teardown' })
  t.teardown(teardown)

  const pipe = Pear.run(dir)

  const td = await Helper.untilResult(pipe, { runFn: () => pipe.end() })
  t.is(td, 'teardown', 'teardown executed')
})

test('teardown with position', { skip: !isBare || isWindows }, async function (t) {
  t.plan(1)

  const dir = path.join(dirname, 'fixtures', 'teardown-with-position')

  const teardown = Helper.rig({ clearRequireCache: '../teardown' })
  t.teardown(teardown)

  const pipe = Pear.run(dir)

  const td = await Helper.untilResult(pipe, { runFn: () => pipe.end() })
  t.is(td, 'teardown', 'teardown executed')
})

test('teardown with type err in first arg', { skip: !isBare || isWindows }, async function (t) {
  t.plan(1)
  const fnErr = `First argument of Pear.teardown must be a function, recieved type 'string'`
  const teardown = Helper.rig({ clearRequireCache: '../teardown' })
  t.teardown(teardown)
  t.exception(() => Pear.teardown('notAFunction'), fnErr)
})

test('teardown with type err in first arg', { skip: !isBare || isWindows }, async function (t) {
  t.plan(1)
  const positionErr = `Second argument of Pear.teardown must be an integer or ±Infinity, recieved type 'string'`
  const teardown = Helper.rig({ clearRequireCache: '../teardown' })
  t.teardown(teardown)
  t.exception(() => Pear.teardown(()=>{}, '5'), positionErr)
})
