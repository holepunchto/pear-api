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

test('state constructor handles missing package.json gracefully', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')
  const state = new State({ dir: '/nonexistent/dir', flags: {} })

  t.is(state.manifest, null, 'manifest should be null when package.json is missing')
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

test('injestPackage initializes state with package data', async function (t) {
  t.plan(6)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')

  const state = {}

  const pkg = {
    main: 'app.js',
    pear: {
      name: 'test-app',
      links: { key1: 'value1' },
      gui: true,
      stage: { entrypoints: ['/entry1', '/entry2'] },
      routes: { '/old': '/new' },
      unrouted: ['/unrouted/path']
    },
    dependencies: { dep1: '1.0.0' },
    devDependencies: { devDep1: '1.0.0' },
    peerDependencies: { peerDep1: '1.0.0' },
    optionalDependencies: { optDep1: '1.0.0' },
    bundleDependencies: ['bundleDep1']
  }

  State.injestPackage(state, pkg)

  t.is(state.main, 'app.js', 'main should be set correctly')
  t.is(state.name, 'test-app', 'name should be set correctly')
  t.is(state.links.key1, 'value1', 'links should be set correctly')
  t.ok(state.entrypoints.has('/entry1'), 'entrypoints should be set correctly')
  t.ok(state.entrypoints.has('/entry2'), 'entrypoints should be set correctly')
  t.is(state.routes['/old'], '/new', 'routes should be set correctly')
})

test('injestPackage merges overrides into state', async function (t) {
  t.plan(3)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')

  const state = {}

  const pkg = {
    pear: {
      links: { key1: 'value1' }
    }
  }

  const overrides = {
    links: 'key2=value2,key3=value3'
  }

  State.injestPackage(state, pkg, overrides)

  t.is(state.links.key1, 'value1', 'overrides should be merged into links')
  t.is(state.links.key2, 'value2', 'overrides should be merged into links')
  t.is(state.links.key3, 'value3', 'overrides should be merged into links')
})

test('injestPackage sets default values when package fields are missing', async function (t) {
  t.plan(3)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')

  const state = {}

  const pkg = {}

  State.injestPackage(state, pkg)

  t.is(state.main, 'index.html', 'main should default to index.html')
  t.is(state.name, null, 'name should default to null')
  t.is(state.entrypoints.size, 0, 'entrypoints should default to an empty set')
})

test('injestPackage adds default unrouted paths', async function (t) {
  t.plan(2)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')

  const state = {}

  const pkg = {
    pear: {
      unrouted: ['/custom/unrouted']
    }
  }

  State.injestPackage(state, pkg)

  t.is(state.unrouted[0], '/custom/unrouted', 'default unrouted paths should be added')
  t.is(state.unrouted[1], '/node_modules/.bin/', 'default unrouted paths should be added')
})

test('injestPackage skips setting entrypoint if not valid', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')

  const state = {}

  const pkg = {
    pear: {
      stage: { entrypoints: ['/invalid'] }
    }
  }

  State.injestPackage(state, pkg)

  t.is(state.entrypoint, '/undefined', 'entrypoint should not be set if not valid')
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

test('state constructor throws error for invalid app name', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const State = require('../state')
  const { ERR_INVALID_APP_NAME } = require('../errors')

  t.exception(() => {
    const state = new State({
      flags: {},
      dir: './test/fixtures/state-invalid-app-name'
    })
    if (state) { t.fail('state should not be initialized') }
  }, ERR_INVALID_APP_NAME())
})
