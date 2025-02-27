'use strict'

const { test } = require('brittle')

const Helper = require('./helper')

test('restart terminal app throw error', async function (t) {
  t.plan(1)

  const teardown = Helper.rig({ state: { ui: null } })
  t.teardown(teardown)

  t.exception(() => Pear.restart(), 'Pear.restart threw an error for terminal app')
})
