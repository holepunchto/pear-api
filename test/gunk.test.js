'use strict'

const { test } = require('brittle')

const gunk = require('../gunk')

test('platform', async function (t) {
  t.ok(gunk.platform.map('id', { protocol: 'test', isImport: true, isBuiltin: false, isSourceMap: false, isConsole: false }) === 'id+test+esm')
  t.ok(gunk.platform.map('id', { protocol: 'test', isImport: false, isBuiltin: true, isSourceMap: false, isConsole: false }) === '/~id+test+cjs')
  t.ok(gunk.platform.map('id', { protocol: 'test', isImport: false, isBuiltin: false, isSourceMap: true, isConsole: false }) === 'id+test+map')
  t.ok(gunk.platform.map('id', { protocol: 'test', isImport: false, isBuiltin: false, isSourceMap: false, isConsole: true }) === 'id+test+test')
})

test('app', async function (t) {
  t.ok(gunk.app.map('id', { protocol: 'test', isImport: true, isBuiltin: false, isSourceMap: false, isConsole: false }) === 'id+test+esm')
  t.ok(gunk.app.map('id', { protocol: 'test', isImport: false, isBuiltin: true, isSourceMap: false, isConsole: false }) === '/~id+test+cjs')
  t.ok(gunk.app.map('id', { protocol: 'test', isImport: false, isBuiltin: false, isSourceMap: true, isConsole: false }) === 'id+test+map')
  t.ok(gunk.app.map('id', { protocol: 'test', isImport: false, isBuiltin: false, isSourceMap: false, isConsole: true }) === 'id+test+test')
})
