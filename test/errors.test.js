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

test('errors ERR_INVALID_INPUT', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_INPUT('invalid input')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'invalid input')
  t.is(error.code, 'ERR_INVALID_INPUT')
  t.is(error.info, null)
  t.ok(error.stack.includes('invalid input'))
})

test('errors ERR_INVALID_LINK', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_LINK('invalid link')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'invalid link')
  t.is(error.code, 'ERR_INVALID_LINK')
  t.is(error.info, null)
  t.ok(error.stack.includes('invalid link'))
})

test('errors ERR_INVALID_APPLING', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_APPLING('invalid appling')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'invalid appling')
  t.is(error.code, 'ERR_INVALID_APPLING')
  t.is(error.info, null)
  t.ok(error.stack.includes('invalid appling'))
})

test('errors ERR_INVALID_APP_NAME', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_APP_NAME('invalid app name')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'invalid app name')
  t.is(error.code, 'ERR_INVALID_APP_NAME')
  t.is(error.info, null)
  t.ok(error.stack.includes('invalid app name'))
})

test('errors ERR_INVALID_APP_STORAGE', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_APP_STORAGE('invalid app storage')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'invalid app storage')
  t.is(error.code, 'ERR_INVALID_APP_STORAGE')
  t.is(error.info, null)
  t.ok(error.stack.includes('invalid app storage'))
})

test('errors ERR_INVALID_PROJECT_DIR', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_PROJECT_DIR('invalid project dir')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'invalid project dir')
  t.is(error.code, 'ERR_INVALID_PROJECT_DIR')
  t.is(error.info, null)
  t.ok(error.stack.includes('invalid project dir'))
})

test('errors ERR_INVALID_GC_RESOURCE', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_GC_RESOURCE('invalid gc resource')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'invalid gc resource')
  t.is(error.code, 'ERR_INVALID_GC_RESOURCE')
  t.is(error.info, null)
  t.ok(error.stack.includes('invalid gc resource'))
})

test('errors ERR_INVALID_CONFIG', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_CONFIG('invalid config')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'invalid config')
  t.is(error.code, 'ERR_INVALID_CONFIG')
  t.is(error.info, null)
  t.ok(error.stack.includes('invalid config'))
})

test('errors ERR_INVALID_TEMPLATE', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_TEMPLATE('invalid template')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'invalid template')
  t.is(error.code, 'ERR_INVALID_TEMPLATE')
  t.is(error.info, null)
  t.ok(error.stack.includes('invalid template'))
})

test('errors ERR_PERMISSION_REQUIRED', async function (t) {
  t.plan(6)

  const error = PearError.ERR_PERMISSION_REQUIRED('permission required', { reason: 'test' })
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'permission required')
  t.is(error.code, 'ERR_PERMISSION_REQUIRED')
  t.is(error.info.reason, 'test')
  t.ok(error.info !== null)
  t.ok(error.stack.includes('permission required'))
})

test('errors ERR_PERMISSION_REQUIRED with different info', async function (t) {
  t.plan(6)

  const error = PearError.ERR_PERMISSION_REQUIRED('permission required', { reason: 'another test' })
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'permission required')
  t.is(error.code, 'ERR_PERMISSION_REQUIRED')
  t.is(error.info.reason, 'another test')
  t.ok(error.info !== null)
  t.ok(error.stack.includes('permission required'))
})

test('errors ERR_SECRET_NOT_FOUND', async function (t) {
  t.plan(5)

  const error = PearError.ERR_SECRET_NOT_FOUND('secret not found')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'secret not found')
  t.is(error.code, 'ERR_SECRET_NOT_FOUND')
  t.is(error.info, null)
  t.ok(error.stack.includes('secret not found'))
})

test('errors ERR_NOT_FOUND_OR_NOT_CONNECTED', async function (t) {
  t.plan(5)

  const error = PearError.ERR_NOT_FOUND_OR_NOT_CONNECTED('not found or not connected')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'not found or not connected')
  t.is(error.code, 'ERR_NOT_FOUND_OR_NOT_CONNECTED')
  t.is(error.info, null)
  t.ok(error.stack.includes('not found or not connected'))
})

test('errors ERR_INVALID_MANIFEST', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INVALID_MANIFEST('invalid manifest')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'invalid manifest')
  t.is(error.code, 'ERR_CONNECTION')
  t.is(error.info, null)
  t.ok(error.stack.includes('invalid manifest'))
})

test('errors ERR_INTERNAL_ERROR', async function (t) {
  t.plan(5)

  const error = PearError.ERR_INTERNAL_ERROR('internal error')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'internal error')
  t.is(error.code, 'ERR_INTERNAL_ERROR')
  t.is(error.info, null)
  t.ok(error.stack.includes('internal error'))
})

test('errors ERR_UNSTAGED', async function (t) {
  t.plan(5)

  const error = PearError.ERR_UNSTAGED('unstaged')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'unstaged')
  t.is(error.code, 'ERR_UNSTAGED')
  t.is(error.info, null)
  t.ok(error.stack.includes('unstaged'))
})

test('errors ERR_DIR_NONEMPTY', async function (t) {
  t.plan(5)

  const error = PearError.ERR_DIR_NONEMPTY('dir nonempty')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'dir nonempty')
  t.is(error.code, 'ERR_DIR_NONEMPTY')
  t.is(error.info, null)
  t.ok(error.stack.includes('dir nonempty'))
})

test('errors ERR_OPERATION_FAILED', async function (t) {
  t.plan(5)

  const error = PearError.ERR_OPERATION_FAILED('operation failed')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'operation failed')
  t.is(error.code, 'ERR_OPERATION_FAILED')
  t.is(error.info, null)
  t.ok(error.stack.includes('operation failed'))
})

test('errors ERR_ASSERTION', async function (t) {
  t.plan(5)

  const error = PearError.ERR_ASSERTION('assertion')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'assertion')
  t.is(error.code, 'ERR_ASSERTION')
  t.is(error.info, null)
  t.ok(error.stack.includes('assertion'))
})

test('errors ERR_UNKNOWN', async function (t) {
  t.plan(5)

  const error = PearError.ERR_UNKNOWN('unknown')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'unknown')
  t.is(error.code, 'ERR_UNKNOWN')
  t.is(error.info, null)
  t.ok(error.stack.includes('unknown'))
})

test('errors ERR_LEGACY', async function (t) {
  t.plan(5)

  const error = PearError.ERR_LEGACY('legacy')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'legacy')
  t.is(error.code, 'ERR_LEGACY')
  t.is(error.info, null)
  t.ok(error.stack.includes('legacy'))
})

test('PearError with stackless true', async function (t) {
  t.plan(4)

  const error = new PearError('stackless error', 'ERR_STACKLESS', PearError, null, true)
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'stackless error')
  t.is(error.code, 'ERR_STACKLESS')
  t.is(error.stack, 'stackless error')
})

test('PearError with stackless false', async function (t) {
  t.plan(5)

  const error = new PearError('normal error', 'ERR_NORMAL', PearError, null, false)
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'normal error')
  t.is(error.code, 'ERR_NORMAL')
  t.is(error.info, null)
  t.ok(error.stack.includes('normal error'))
})

test('PearError with info', async function (t) {
  t.plan(6)

  const error = new PearError('error with info', 'ERR_WITH_INFO', PearError, { detail: 'some detail' })
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'error with info')
  t.is(error.code, 'ERR_WITH_INFO')
  t.is(error.info.detail, 'some detail')
  t.ok(error.info !== null)
  t.ok(error.stack.includes('error with info'))
})

test('PearError without info', async function (t) {
  t.plan(5)

  const error = new PearError('error without info', 'ERR_WITHOUT_INFO')
  t.exception(() => { throw error }, PearError)
  t.is(error.message, 'error without info')
  t.is(error.code, 'ERR_WITHOUT_INFO')
  t.is(error.info, null)
  t.ok(error.stack.includes('error without info'))
})
