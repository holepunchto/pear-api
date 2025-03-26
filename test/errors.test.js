'use strict'

const { test } = require('brittle')

const PearError = require('../errors')

test('known function with default prefix', async function (t) {
  t.plan(1)

  const knownErrors = PearError.known()
  t.ok(Array.isArray(knownErrors) && knownErrors.length > 0)
})

test('known function with custom prefix', async function (t) {
  t.plan(1)

  const knownErrors = PearError.known('ERR_INVALID')
  t.ok(Array.isArray(knownErrors) && knownErrors.length > 0)
})

test('known function with multiple prefixes', async function (t) {
  t.plan(1)

  const knownErrors = PearError.known('ERR_INVALID', 'ERR_PERMISSION')
  t.ok(Array.isArray(knownErrors) && knownErrors.length > 0)
})

test('known function with more than two prefixes', async function (t) {
  t.plan(1)

  const knownErrors = PearError.known('ERR_INVALID', 'ERR_PERMISSION', 'ERR_INTERNAL')
  t.ok(Array.isArray(knownErrors) && knownErrors.length > 0)
})

test('known function with no matching prefix', async function (t) {
  t.plan(2)

  const knownErrors = PearError.known('ERR_NON_EXISTENT')
  t.ok(Array.isArray(knownErrors))
  t.is(knownErrors.length, 0)
})

test('captureStackTrace filters out PearError only', async function (t) {
  t.plan(2)

  const pearErr = PearError.ERR_INVALID_INPUT('invalid input')
  t.is(pearErr.stack.includes('ERR_INVALID_INPUT'), false)

  function ERR_CUSTOM (msg) {
    return new Error(msg, 'ERR_CUSTOM', ERR_CUSTOM)
  }
  const customErr = ERR_CUSTOM('custom error')
  t.is(customErr.stack.includes('ERR_CUSTOM'), true)
})
