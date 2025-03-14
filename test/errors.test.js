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
  t.plan(1)

  const knownErrors = PearError.known('ERR_NON_EXISTENT')
  t.ok(Array.isArray(knownErrors) && knownErrors.length === 0)
})

test('errors ERR_INVALID_INPUT', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_INPUT('invalid input')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'invalid input')
  t.ok(error.code === 'ERR_INVALID_INPUT')
  t.ok(error.info === null)
  t.ok(error.stack.includes('invalid input'))
})

test('errors ERR_INVALID_LINK', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_LINK('invalid link')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'invalid link')
  t.ok(error.code === 'ERR_INVALID_LINK')
  t.ok(error.info === null)
  t.ok(error.stack.includes('invalid link'))
})

test('errors ERR_INVALID_APPLING', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_APPLING('invalid appling')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'invalid appling')
  t.ok(error.code === 'ERR_INVALID_APPLING')
  t.ok(error.info === null)
  t.ok(error.stack.includes('invalid appling'))
})

test('errors ERR_INVALID_APP_NAME', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_APP_NAME('invalid app name')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'invalid app name')
  t.ok(error.code === 'ERR_INVALID_APP_NAME')
  t.ok(error.info === null)
  t.ok(error.stack.includes('invalid app name'))
})

test('errors ERR_INVALID_APP_STORAGE', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_APP_STORAGE('invalid app storage')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'invalid app storage')
  t.ok(error.code === 'ERR_INVALID_APP_STORAGE')
  t.ok(error.info === null)
  t.ok(error.stack.includes('invalid app storage'))
})

test('errors ERR_INVALID_PROJECT_DIR', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_PROJECT_DIR('invalid project dir')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'invalid project dir')
  t.ok(error.code === 'ERR_INVALID_PROJECT_DIR')
  t.ok(error.info === null)
  t.ok(error.stack.includes('invalid project dir'))
})

test('errors ERR_INVALID_GC_RESOURCE', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_GC_RESOURCE('invalid gc resource')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'invalid gc resource')
  t.ok(error.code === 'ERR_INVALID_GC_RESOURCE')
  t.ok(error.info === null)
  t.ok(error.stack.includes('invalid gc resource'))
})

test('errors ERR_INVALID_CONFIG', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_CONFIG('invalid config')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'invalid config')
  t.ok(error.code === 'ERR_INVALID_CONFIG')
  t.ok(error.info === null)
  t.ok(error.stack.includes('invalid config'))
})

test('errors ERR_INVALID_TEMPLATE', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_TEMPLATE('invalid template')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'invalid template')
  t.ok(error.code === 'ERR_INVALID_TEMPLATE')
  t.ok(error.info === null)
  t.ok(error.stack.includes('invalid template'))
})

test('errors ERR_PERMISSION_REQUIRED', async function (t) {
  t.plan(6)

  const error = PearError.ERR_PERMISSION_REQUIRED('permission required', { reason: 'test' })
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'permission required')
  t.ok(error.code === 'ERR_PERMISSION_REQUIRED')
  t.ok(error.info.reason === 'test')
  t.ok(error.info !== null)
  t.ok(error.stack.includes('permission required'))
})

test('errors ERR_PERMISSION_REQUIRED with different info', async function (t) {
  t.plan(6)

  const error = PearError.ERR_PERMISSION_REQUIRED('permission required', { reason: 'another test' })
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'permission required')
  t.ok(error.code === 'ERR_PERMISSION_REQUIRED')
  t.ok(error.info.reason === 'another test')
  t.ok(error.info !== null)
  t.ok(error.stack.includes('permission required'))
})

test('errors ERR_SECRET_NOT_FOUND', async function (t) {
  t.plan(5)

  const error = PearError.ERR_SECRET_NOT_FOUND('secret not found')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'secret not found')
  t.ok(error.code === 'ERR_SECRET_NOT_FOUND')
  t.ok(error.info === null)
  t.ok(error.stack.includes('secret not found'))
})

test('errors ERR_NOT_FOUND_OR_NOT_CONNECTED', async function (t) {
  t.plan(5)

  const error = PearError.ERR_NOT_FOUND_OR_NOT_CONNECTED('not found or not connected')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'not found or not connected')
  t.ok(error.code === 'ERR_NOT_FOUND_OR_NOT_CONNECTED')
  t.ok(error.info === null)
  t.ok(error.stack.includes('not found or not connected'))
})

test('errors ERR_INVALID_MANIFEST', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_MANIFEST('invalid manifest')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'invalid manifest')
  t.ok(error.code === 'ERR_CONNECTION')
  t.ok(error.info === null)
  t.ok(error.stack.includes('invalid manifest'))
})

test('errors ERR_INTERNAL_ERROR', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INTERNAL_ERROR('internal error')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'internal error')
  t.ok(error.code === 'ERR_INTERNAL_ERROR')
  t.ok(error.info === null)
  t.ok(error.stack.includes('internal error'))
})

test('errors ERR_UNSTAGED', async function (t) {
  t.plan(5)

  const error = PearError.ERR_UNSTAGED('unstaged')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'unstaged')
  t.ok(error.code === 'ERR_UNSTAGED')
  t.ok(error.info === null)
  t.ok(error.stack.includes('unstaged'))
})

test('errors ERR_DIR_NONEMPTY', async function (t) {
  t.plan(5)

  const error = PearError.ERR_DIR_NONEMPTY('dir nonempty')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'dir nonempty')
  t.ok(error.code === 'ERR_DIR_NONEMPTY')
  t.ok(error.info === null)
  t.ok(error.stack.includes('dir nonempty'))
})

test('errors ERR_OPERATION_FAILED', async function (t) {
  t.plan(5)

  const error = PearError.ERR_OPERATION_FAILED('operation failed')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'operation failed')
  t.ok(error.code === 'ERR_OPERATION_FAILED')
  t.ok(error.info === null)
  t.ok(error.stack.includes('operation failed'))
})

test('errors ERR_ASSERTION', async function (t) {
  t.plan(5)

  const error = PearError.ERR_ASSERTION('assertion')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'assertion')
  t.ok(error.code === 'ERR_ASSERTION')
  t.ok(error.info === null)
  t.ok(error.stack.includes('assertion'))
})

test('errors ERR_UNKNOWN', async function (t) {
  t.plan(5)

  const error = PearError.ERR_UNKNOWN('unknown')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'unknown')
  t.ok(error.code === 'ERR_UNKNOWN')
  t.ok(error.info === null)
  t.ok(error.stack.includes('unknown'))
})

test('errors ERR_LEGACY', async function (t) {
  t.plan(5)

  const error = PearError.ERR_LEGACY('legacy')
  t.exception(() => { throw error }, PearError)
  t.ok(error.message === 'legacy')
  t.ok(error.code === 'ERR_LEGACY')
  t.ok(error.info === null)
  t.ok(error.stack.includes('legacy'))
})
