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
  const teardown = Helper.rig({ clearRequireCache: '../teardown' })
  t.teardown(teardown)

  try {
    Pear.teardown('test')
  } catch (err) {
    console.log(err)
  }

  t.exception(() => Pear.teardown('notAFunction'), /teardown expects function/)
})

test('teardown with type err in second arg', { skip: !isBare || isWindows }, async function (t) {
  t.plan(1)
  const teardown = Helper.rig({ clearRequireCache: '../teardown' })
  t.teardown(teardown)

  t.exception(() => Pear.teardown(() => {}, 'notAnInt'), /teardown position must be integer/)
})
