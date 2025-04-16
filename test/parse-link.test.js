'use strict'

const { test } = require('brittle')
const { pathToFileURL } = require('url-file-url')

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

test('parse-link ./some/path/to/a/file.js', async function (t) {
  t.plan(7)

  const { teardown } = rig()
  t.teardown(teardown)

  const parseLink = require('../parse-link')

  const res = parseLink('./some/path/to/a/file.js')
  t.is(res.protocol, 'file:')
  t.is(res.pathname, pathToFileURL('./some/path/to/a/file.js').pathname)
  t.is(res.hash, '')
  t.is(res.drive.key, null)
  t.is(res.drive.length, null)
  t.is(res.drive.fork, null)
  t.is(res.drive.hash, null)
})

test('parse-link file:///some/path/to/a/file.js', async function (t) {
  t.plan(7)

  const { teardown } = rig()
  t.teardown(teardown)

  const parseLink = require('../parse-link')

  const res = parseLink('file:///some/path/to/a/file.js')
  t.is(res.protocol, 'file:')
  t.is(res.pathname, '/some/path/to/a/file.js')
  t.is(res.hash, '')
  t.is(res.drive.key, null)
  t.is(res.drive.length, null)
  t.is(res.drive.fork, null)
  t.is(res.drive.hash, null)
})

test('parse-link pear://key', async function (t) {
  t.plan(8)

  const { teardown } = rig()
  t.teardown(teardown)

  const parseLink = require('../parse-link')

  const key = 'd47c1dfecec0f74a067985d2f8d7d9ad15f9ae5ff648f7bc6ca28e41d70ed221'
  const res = parseLink(`pear://${key}`)
  t.is(res.protocol, 'pear:')
  t.is(res.pathname, '')
  t.is(res.hash, '')
  t.is(res.drive.key.toString('hex'), key)
  t.is(res.drive.length, 0)
  t.is(res.drive.fork, null)
  t.is(res.drive.hash, null)
  t.is(res.drive.alias, null)
})

test('parse-link alias pear://alias', async function (t) {
  t.plan(24)

  const { teardown } = rig()
  t.teardown(teardown)

  const parseLink = require('../parse-link')
  const constants = require('../constants')

  const aliases = ['keet', 'runtime', 'doctor']
  for (const alias of aliases) {
    const res = parseLink(`pear://${alias}`)
    t.is(res.protocol, 'pear:')
    t.is(res.pathname, '')
    t.is(res.hash, '')
    t.is(res.drive.key, constants.ALIASES[alias])
    t.is(res.drive.length, 0)
    t.is(res.drive.fork, null)
    t.is(res.drive.hash, null)
    t.is(res.drive.alias, alias)
  }
})

test('parse-link pear://fork.length.key', async function (t) {
  t.plan(8)

  const { teardown } = rig()
  t.teardown(teardown)

  const parseLink = require('../parse-link')

  const key = 'd47c1dfecec0f74a067985d2f8d7d9ad15f9ae5ff648f7bc6ca28e41d70ed221'
  const res = parseLink(`pear://123.456.${key}`)
  t.is(res.protocol, 'pear:')
  t.is(res.pathname, '')
  t.is(res.hash, '')
  t.is(res.drive.key.toString('hex'), key)
  t.is(res.drive.length, 456)
  t.is(res.drive.fork, 123)
  t.is(res.drive.hash, null)
  t.is(res.drive.alias, null)
})

test('parse-link alias pear://fork.length.alias', async function (t) {
  t.plan(24)

  const { teardown } = rig()
  t.teardown(teardown)

  const parseLink = require('../parse-link')
  const constants = require('../constants')

  const aliases = ['keet', 'runtime', 'doctor']
  for (const alias of aliases) {
    const res = parseLink(`pear://123.456.${alias}`)
    t.is(res.protocol, 'pear:')
    t.is(res.pathname, '')
    t.is(res.hash, '')
    t.is(res.drive.key, constants.ALIASES[alias])
    t.is(res.drive.length, 456)
    t.is(res.drive.fork, 123)
    t.is(res.drive.hash, null)
    t.is(res.drive.alias, alias)
  }
})

test('parse-link pear://fork.length.key.dhash', async function (t) {
  t.plan(8)

  const { teardown } = rig()
  t.teardown(teardown)

  const parseLink = require('../parse-link')

  const key = 'd47c1dfecec0f74a067985d2f8d7d9ad15f9ae5ff648f7bc6ca28e41d70ed221'
  const dhash = '38d8296e972167f4ad37803999fbcac17025271162f44dcdce1188d4bc5bac1d'
  const res = parseLink(`pear://123.456.${key}.${dhash}`)
  t.is(res.protocol, 'pear:')
  t.is(res.pathname, '')
  t.is(res.hash, '')
  t.is(res.drive.key.toString('hex'), key)
  t.is(res.drive.length, 456)
  t.is(res.drive.fork, 123)
  t.is(res.drive.hash.toString('hex'), dhash)
  t.is(res.drive.alias, null)
})

test('parse-link invalid link', async function (t) {
  t.plan(10)

  const { teardown } = rig()
  t.teardown(teardown)

  const parseLink = require('../parse-link')
  const { ERR_INVALID_LINK } = require('../errors')

  t.exception(() => parseLink(), ERR_INVALID_LINK())
  t.exception(() => parseLink(''), ERR_INVALID_LINK())
  t.exception(() => parseLink('pear://invalid-key'))
  t.exception(() => parseLink('pear://a.b.c.d.e'))
  t.exception(() => parseLink('pear://123.456'), ERR_INVALID_LINK())
  t.exception(() => parseLink('pear://123.nan.d47c1dfecec0f74a067985d2f8d7d9ad15f9ae5ff648f7bc6ca28e41d70ed221'), ERR_INVALID_LINK())
  t.exception(() => parseLink('pear://nan.123.keet'), ERR_INVALID_LINK())
  t.exception(() => parseLink('pear://123.nan.d47c1dfecec0f74a067985d2f8d7d9ad15f9ae5ff648f7bc6ca28e41d70ed221.38d8296e972167f4ad37803999fbcac17025271162f44dcdce1188d4bc5bac1d'), ERR_INVALID_LINK())
  t.exception(() => parseLink('pear://nan.123.keet.38d8296e972167f4ad37803999fbcac17025271162f44dcdce1188d4bc5bac1d'), ERR_INVALID_LINK())
  t.exception(() => parseLink('unsupport://abc'), ERR_INVALID_LINK())
})
