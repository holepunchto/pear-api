'use strict'

const { test } = require('brittle')

const Helper = require('./helper')

test('reload terminal app throw error', async function (t) {
  t.plan(1)

  const teardown = Helper.rig({ state: { ui: null } })
  t.teardown(teardown)

  t.exception(() => Pear.reload(), 'Pear.reload threw an error for terminal app')
})

test('reload desktop app throw error', async function (t) {
  t.plan(1)

  const teardown = Helper.rig()
  t.teardown(teardown)

  t.exception(() => Pear.reload({ platform: 'darwin' }), 'Pear.reload threw an error for desktop app')
})

test('reload ok', async function (t) {
  t.plan(1)

  const teardown = Helper.rig()
  t.teardown(teardown)

  const reloaded = Helper.createLazyPromise()
  global.location = { reload: () => reloaded.resolve() }

  Pear.reload()

  await reloaded.promise
  t.pass('Pear.reload ok')
})
