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

  t.not(state.env === null, 'env should be initialized')
  t.not(state.cwd === null, 'cwd should be initialized')
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

  t.is(state.flags.invalidFlag, true, 'invalid flags should be preserved in state')
})

test('state update method merges new state properties', async function (t) {
  t.plan(2)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')
  const state = new State({ flags: {} })
  state.update({ newProp: 'newValue' })

  t.is(state.newProp, 'newValue', 'new property should be added to state')
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

test('state storageFromLink generates storage path for non-pear links', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')
  const link = 'file:///some/path/to/a/file.js'
  const result = State.storageFromLink(link)

  t.ok(result.includes('by-random'), 'storageFromLink should generate path under by-random for non-pear links')
})

test('state storageFromLink generates storage path for pear links', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')
  const link = 'pear://keet'
  const result = State.storageFromLink(link)

  t.ok(result.includes('by-dkey'), 'storageFromLink should generate path under by-dkey for pear links')
})

test('state configFrom extracts correct properties from state', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')
  const state = new State({ flags: {} })
  const config = State.configFrom(state)

  t.ok(config.env !== undefined, 'configFrom should extract env property from state')
})

test('state constructor throws error for invalid storage path', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')
  const { ERR_INVALID_APP_STORAGE } = require('../errors')

  t.exception(() => {
    const state = new State({
      flags: {},
      dir: '/valid/project/dir',
      storage: '/valid/project/dir/storage'
    })
    if (state) { t.fail('state should not be initialized') }
  }, ERR_INVALID_APP_STORAGE())
})

test('store flag change state storage', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')
  const state = new State({ flags: { store: '/path/to/store' } })

  t.is(state.storage, '/path/to/store')
})

test('invalid storage when its inside project dir', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')
  t.exception(() => new State({ flags: { store: './store' } }))
})

test('temporary storage', async function (t) {
  t.plan(2)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')
  const state = new State({ flags: { tmpStore: true } })

  t.not(state.storage.includes('by-dkey'))
  t.not(state.storage.includes('by-random'))
})
