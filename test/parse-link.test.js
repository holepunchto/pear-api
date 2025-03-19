'use strict'

const { test } = require('brittle')

const dirname = __dirname
global.Pear = null

const rig = () => {
  if (global.Pear !== null) throw Error(`Prior Pear global not cleaned up: ${global.Pear}`)

  class RigAPI {
    static RTI = { checkout: { key: dirname, length: null, fork: null } }
  }
  global.Pear = new RigAPI()

  return {
    teardown: () => { global.Pear = null }
  }
}

test('parse-link file:///some/path/to/a/file.js', async function (t) {
  t.plan(7)

  const { teardown } = rig()
  t.teardown(teardown)

  const parseLink = require('../parse-link')

  const res = parseLink('file:///some/path/to/a/file.js')
  t.ok(res.protocol === 'file:')
  t.ok(res.pathname === '/some/path/to/a/file.js')
  t.ok(res.hash === '')
  t.ok(res.drive.key === null)
  t.ok(res.drive.length === null)
  t.ok(res.drive.fork === null)
  t.ok(res.drive.hash === null)
})

test('parse-link pear://<key>', async function (t) {
  t.plan(8)

  const { teardown } = rig()
  t.teardown(teardown)

  const parseLink = require('../parse-link')

  const key = 'd47c1dfecec0f74a067985d2f8d7d9ad15f9ae5ff648f7bc6ca28e41d70ed221'
  const res = parseLink(`pear://${key}`)
  t.ok(res.protocol === 'pear:')
  t.ok(res.pathname === '')
  t.ok(res.hash === '')
  t.ok(res.drive.key.toString('hex') === key)
  t.ok(res.drive.length === 0)
  t.ok(res.drive.fork === null)
  t.ok(res.drive.hash === null)
  t.ok(res.drive.alias === null)
})

test('parse-link alias pear://keet', async function (t) {
  t.plan(8)

  const { teardown } = rig()
  t.teardown(teardown)

  const parseLink = require('../parse-link')
  const constants = require('../constants')

  const key = 'keet'
  const res = parseLink(`pear://${key}`)
  t.ok(res.protocol === 'pear:')
  t.ok(res.pathname === '')
  t.ok(res.hash === '')
  t.ok(res.drive.key === constants.ALIASES[key])
  t.ok(res.drive.length === 0)
  t.ok(res.drive.fork === null)
  t.ok(res.drive.hash === null)
  t.ok(res.drive.alias === key)
})

test('parse-link alias pear://runtime', async function (t) {
  t.plan(8)

  const { teardown } = rig()
  t.teardown(teardown)

  const parseLink = require('../parse-link')
  const constants = require('../constants')

  const key = 'runtime'
  const res = parseLink(`pear://${key}`)
  t.ok(res.protocol === 'pear:')
  t.ok(res.pathname === '')
  t.ok(res.hash === '')
  t.ok(res.drive.key === constants.ALIASES[key])
  t.ok(res.drive.length === 0)
  t.ok(res.drive.fork === null)
  t.ok(res.drive.hash === null)
  t.ok(res.drive.alias === key)
})

test('parse-link alias pear://doctor', async function (t) {
  t.plan(8)

  const { teardown } = rig()
  t.teardown(teardown)

  const parseLink = require('../parse-link')
  const constants = require('../constants')

  const key = 'doctor'
  const res = parseLink(`pear://${key}`)
  t.ok(res.protocol === 'pear:')
  t.ok(res.pathname === '')
  t.ok(res.hash === '')
  t.ok(res.drive.key === constants.ALIASES[key])
  t.ok(res.drive.length === 0)
  t.ok(res.drive.fork === null)
  t.ok(res.drive.hash === null)
  t.ok(res.drive.alias === key)
})

test('parse-link error', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const parseLink = require('../parse-link')

  t.exception(() => parseLink('pear://unknown'))
})
