'use strict'

const { test } = require('brittle')

test('errors ERR_INVALID_INPUT', async function (t) {
  t.plan(1)

  const PearError = require('../errors')
  const error = PearError.ERR_INVALID_INPUT('invalid input')
  t.exception(() => { throw error }, 'invalid input')
})
