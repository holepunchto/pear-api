'use strict'

const { test } = require('brittle')
const Logger = require('../logger')

const consoleLogOrigin = console.log

test('logger', async function (t) {
  t.plan(1)

  const Logger = require('../logger')
  console.log = (msg) => { throw new Error(`console.log called ${msg}`) }
  t.teardown(() => { console.log = consoleLogOrigin })

  const logger = new Logger({ labels: ['label-test'], level: Logger.INF })
  t.exception(() => logger.info('label-test', 'hello'), 'console.log called hello')
  logger.error('label-random', 'world')
})

test('logger error method', async function (t) {
  t.plan(1)

  console.error = (msg) => { throw new Error(`console.error called ${msg}`) }
  t.teardown(() => { console.error = consoleLogOrigin })

  const logger = new Logger({ labels: ['label-test'], level: Logger.ERR })
  t.exception(() => logger.error('label-test', 'error message'), 'console.error called error message')
  logger.info('label-random', 'info message')
})

test('logger trace method', async function (t) {
  t.plan(1)

  console.error = (msg) => { throw new Error(`console.error called ${msg}`) }
  t.teardown(() => { console.error = consoleLogOrigin })

  const logger = new Logger({ labels: ['label-test'], level: Logger.TRC })
  t.exception(() => logger.trace('label-test', 'trace message'), 'console.error called trace message')
  logger.info('label-random', 'info message')
})

test('logger with multiple labels', async function (t) {
  t.plan(2)

  console.log = (msg) => { throw new Error(`console.log called ${msg}`) }
  t.teardown(() => { console.log = consoleLogOrigin })

  const logger = new Logger({ labels: ['label-test', 'label-extra'], level: Logger.INF })
  t.exception(() => logger.info('label-test', 'hello'), 'console.log called hello')
  t.exception(() => logger.info('label-extra', 'world'), 'console.log called world')
  logger.error('label-random', 'error message')
})
