'use strict'

const { test } = require('brittle')
const { isWindows } = require('which-runtime')

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

test('usage object structure', async function (t) {
  t.plan(4)

  const { teardown } = rig()
  t.teardown(teardown)

  const { usage } = require('../terminal')
  t.ok(typeof usage === 'object', 'usage should be an object')
  t.ok(typeof usage.header === 'string', 'usage.header should be a string')
  t.ok(typeof usage.version === 'string', 'usage.version should be a string')
  t.ok(typeof usage.footer === 'object', 'usage.footer should be an object')
})

test('usage.header content', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const { usage } = require('../terminal')
  t.ok(usage.header.includes('Welcome to the Internet of Peers'), 'usage.header should contain welcome message')
})

test('usage.version format', async function (t) {
  t.plan(1)

  const { teardown } = rig()
  t.teardown(teardown)

  const { usage } = require('../terminal')
  t.ok(usage.version === `0.dev.${dirname}`)
})

test('usage.footer content', async function (t) {
  t.plan(2)

  const { teardown } = rig()
  t.teardown(teardown)

  const { usage } = require('../terminal')
  t.ok(usage.footer.overview.includes('Legend'), 'usage.footer.overview should contain legend')
  t.ok(usage.footer.help.includes('Welcome to the IoP'), 'usage.footer.help should contain welcome message')
})

test('ansi formatting functions', async function (t) {
  t.plan(14)

  const { teardown } = rig()
  t.teardown(teardown)

  const { ansi } = require('../terminal')
  if (isWindows) {
    t.is(ansi.bold('text'), 'text', 'ansi.bold should format text correctly')
    t.is(ansi.dim('text'), 'text', 'ansi.dim should format text correctly')
    t.is(ansi.italic('text'), 'text', 'ansi.italic should format text correctly')
    t.is(ansi.underline('text'), 'text', 'ansi.underline should format text correctly')
    t.is(ansi.inverse('text'), 'text', 'ansi.inverse should format text correctly')
    t.is(ansi.red('text'), 'text', 'ansi.red should format text correctly')
    t.is(ansi.green('text'), 'text', 'ansi.green should format text correctly')
    t.is(ansi.yellow('text'), 'text', 'ansi.yellow should format text correctly')
    t.is(ansi.gray('text'), 'text', 'ansi.gray should format text correctly')
    t.is(ansi.upHome(), '', 'ansi.upHome should format text correctly')
    t.is(ansi.link('text'), 'text', 'ansi.link should format text correctly')
    t.is(ansi.hideCursor(), '', 'ansi.hideCursor should format text correctly')
    t.is(ansi.showCursor(), '', 'ansi.showCursor should format text correctly')
    return
  }

  t.is(ansi.bold('text'), '\x1B[1mtext\x1B[22m', 'ansi.bold should format text correctly')
  t.is(ansi.dim('text'), '\x1B[2mtext\x1B[22m', 'ansi.dim should format text correctly')
  t.is(ansi.italic('text'), '\x1B[3mtext\x1B[23m', 'ansi.italic should format text correctly')
  t.is(ansi.underline('text'), '\x1B[4mtext\x1B[24m', 'ansi.underline should format text correctly')
  t.is(ansi.inverse('text'), '\x1B[7mtext\x1B[27m', 'ansi.inverse should format text correctly')
  t.is(ansi.red('text'), '\x1B[31mtext\x1B[39m', 'ansi.red should format text correctly')
  t.is(ansi.green('text'), '\x1B[32mtext\x1B[39m', 'ansi.green should format text correctly')
  t.is(ansi.yellow('text'), '\x1B[33mtext\x1B[39m', 'ansi.yellow should format text correctly')
  t.is(ansi.gray('text'), '\x1B[90mtext\x1B[39m', 'ansi.gray should format text correctly')
  t.is(ansi.upHome(), '\x1B[1F', 'ansi.upHome should format text correctly')
  t.is(ansi.upHome(35), '\x1B[35F', 'ansi.upHome should format text correctly')
  t.is(ansi.link('url', 'text'), '\x1B]8;;url\x07text\x1B]8;;\x07', 'ansi.link should format text correctly')
  t.is(ansi.hideCursor(), '\x1B[?25l', 'ansi.hideCursor should format text correctly')
  t.is(ansi.showCursor(), '\x1B[?25h', 'ansi.showCursor should format text correctly')
})

test('ansi special characters', async function (t) {
  t.plan(9)

  const { teardown } = rig()
  t.teardown(teardown)

  const { ansi } = require('../terminal')

  if (isWindows) {
    t.is(ansi.sep, '-', 'ansi.sep should be formatted correctly')
    t.is(ansi.tick, '^', 'ansi.tick should be formatted correctly')
    t.is(ansi.cross, 'x', 'ansi.cross should be formatted correctly')
    t.is(ansi.warning, '!', 'ansi.warning should be formatted correctly')
    t.is(ansi.pear, '*', 'ansi.pear should be formatted correctly')
    t.is(ansi.dot, '•', 'ansi.dot should be formatted correctly')
    t.is(ansi.key, '>', 'ansi.key should be formatted correctly')
    t.is(ansi.down, '↓', 'ansi.down should be formatted correctly')
    t.is(ansi.up, '↑', 'ansi.up should be formatted correctly')
    return
  }

  t.is(ansi.sep, ansi.dim(ansi.green('∞')), 'ansi.sep should be formatted correctly')
  t.is(ansi.tick, ansi.green('✔'), 'ansi.tick should be formatted correctly')
  t.is(ansi.cross, ansi.red('✖'), 'ansi.cross should be formatted correctly')
  t.is(ansi.warning, '⚠️', 'ansi.warning should be formatted correctly')
  t.is(ansi.pear, '🍐', 'ansi.pear should be formatted correctly')
  t.is(ansi.dot, 'o', 'ansi.dot should be formatted correctly')
  t.is(ansi.key, '🔑', 'ansi.key should be formatted correctly')
  t.is(ansi.down, '⬇', 'ansi.down should be formatted correctly')
  t.is(ansi.up, '⬆', 'ansi.up should be formatted correctly')
})

test('indicator function', async function (t) {
  t.plan(6)

  const { teardown } = rig()
  t.teardown(teardown)

  const { indicator, ansi } = require('../terminal')

  t.is(indicator(true), ansi.tick + ' ', 'indicator should return tick for true')
  t.is(indicator(false), ansi.cross + ' ', 'indicator should return cross for false')
  t.is(indicator(null), ansi.gray('- '), 'indicator should return gray dash for null')
  t.is(indicator(1), ansi.tick + ' ', 'indicator should return tick for positive number')
  t.is(indicator(-1), ansi.cross + ' ', 'indicator should return cross for negative number')
  t.is(indicator(0), ansi.gray('- '), 'indicator should return gray dash for zero')
})

test('status function', async function (t) {
  t.plan(3)

  const { teardown } = rig()
  t.teardown(teardown)

  const { status, stdio, ansi } = require('../terminal')

  const originalWrite = stdio.out.write
  let output = ''
  stdio.out.write = (str) => { output += str }

  status('Test message', true)
  t.ok(output.includes(ansi.tick + ' Test message'), 'status should print success message correctly')

  output = ''
  status('Test message', false)
  t.ok(output.includes(ansi.cross + ' Test message'), 'status should print failure message correctly')

  output = ''
  status('Test message')
  t.ok(output.includes('Test message'), 'status should print message without success indicator')

  stdio.out.write = originalWrite
})

test('print function', async function (t) {
  t.plan(3)

  const { teardown } = rig()
  t.teardown(teardown)

  const { print, ansi } = require('../terminal')

  const originalConsoleLog = console.log
  let output = ''
  console.log = (str) => { output += str }
  t.teardown(() => { console.log = originalConsoleLog })

  print('Test message', true)
  t.ok(output.includes(ansi.tick + ' Test message'), 'print should print success message correctly')

  output = ''
  print('Test message', false)
  t.ok(output.includes(ansi.cross + ' Test message'), 'print should print failure message correctly')

  output = ''
  print('Test message')
  t.ok(output.includes('Test message'), 'print should print message without success indicator')
})
