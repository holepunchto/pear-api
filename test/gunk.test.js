'use strict'

const { test } = require('brittle')

const defaults = require('script-linker/defaults')

test('gunk', async function (t) {
  const gunk = require('../gunk')
  t.ok(gunk.platform.symbol === `platform-${defaults.symbol}`)
})
