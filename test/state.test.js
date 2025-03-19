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

test('state constructor initializes with minimal parameters', async function (t) {
  t.plan(2)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')
  const state = new State({ flags: {} })

  t.ok(state.env !== null, 'env should be initialized')
  t.ok(state.cwd !== null, 'cwd should be initialized')
})

test('state constructor handles missing package.json gracefully', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')
  const state = new State({ dir: '/nonexistent/dir', flags: {} })

  t.ok(state.manifest === null, 'manifest should be null when package.json is missing')
})

test('state constructor sets NODE_ENV to production in stage mode', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')
  const state = new State({ flags: { stage: true } })

  t.is(state.env.NODE_ENV, 'production', 'NODE_ENV should be set to production in stage mode')
})

test('state constructor sets NODE_ENV to production when run flag is true and not in dev mode', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')
  const state = new State({ flags: { run: true, dev: false } })

  t.is(state.env.NODE_ENV, 'production', 'NODE_ENV should be set to production when run flag is true and not in dev mode')
})

test('state constructor handles invalid flags gracefully', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')
  const state = new State({ flags: { invalidFlag: true } })

  t.ok(state.flags.invalidFlag === true, 'invalid flags should be preserved in state')
})

test('state update method merges new state properties', async function (t) {
  t.plan(2)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')
  const state = new State({ flags: {} })
  state.update({ newProp: 'newValue' })

  t.ok(state.newProp === 'newValue', 'new property should be added to state')
  t.ok(state.flags !== undefined, 'existing properties should not be removed')
})

test('state route method returns pathname when no routes are defined', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const pathname = '/test/path'
  const State = require('../state')
  const result = State.route(pathname, null, [])

  t.is(result, pathname, 'route method should return pathname when no routes are defined')
})

test('state route method applies routes correctly', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const pathname = '/test/path'
  const routes = { '/test/path': '/new/path' }
  const State = require('../state')
  const result = State.route(pathname, routes, [])

  t.is(result, '/new/path', 'route method should apply routes correctly')
})

test('state route method skips unrouted paths', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const pathname = '/node_modules/.bin/test'
  const unrouted = ['/node_modules/.bin/']
  const State = require('../state')
  const result = State.route(pathname, {}, unrouted)

  t.is(result, pathname, 'route method should skip unrouted paths')
})

test('state isEntrypoint returns false for null or root path', async function (t) {
  t.plan(2)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')

  t.ok(!State.isEntrypoint(null), 'isEntrypoint should return false for null')
  t.ok(!State.isEntrypoint('/'), 'isEntrypoint should return false for root path')
})

test('state isEntrypoint returns true for valid entrypoint', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')

  t.ok(State.isEntrypoint('/valid/path'), 'isEntrypoint should return true for valid entrypoint')
})

test('state storageFromLink generates storage path for non-pear links', async function (t) {
  t.plan(1)

  const link = 'file:///some/path/to/a/file.js'
  const State = require('../state')
  const result = State.storageFromLink(link)

  t.ok(result.includes('by-random'), 'storageFromLink should generate path under by-random for non-pear links')
})

test('state storageFromLink generates storage path for pear links', async function (t) {
  t.plan(1)

  const link = 'pear://keet'
  const State = require('../state')
  const result = State.storageFromLink(link)

  t.ok(result.includes('by-dkey'), 'storageFromLink should generate path under by-dkey for pear links')
})

test('state configFrom extracts correct properties from state', async function (t) {
  t.plan(1)

  const State = require('../state')
  const state = new State({ flags: {} })
  const config = State.configFrom(state)

  t.ok(config.env !== undefined, 'configFrom should extract env property from state')
})
