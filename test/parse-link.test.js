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

test('parse-link', async function (t) {
  t.plan(8)

  const { teardown } = rig()
  t.teardown(teardown)

  const parseLink = require('../parse-link')
  const constants = require('../constants')

  const res = parseLink('pear://keet')
  t.ok(res.protocol === 'pear:')
  t.ok(res.pathname === '')
  t.ok(res.hash === '')
  t.ok(res.drive.key === constants.ALIASES.keet)
  t.ok(res.drive.length === 0)
  t.ok(res.drive.fork === null)
  t.ok(res.drive.hash === null)
  t.ok(res.drive.alias === 'keet')
})

test('parse-link error', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const parseLink = require('../parse-link')

  t.exception(() => parseLink('pear://unknown'))
})
