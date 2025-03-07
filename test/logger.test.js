'use strict'

const { test } = require('brittle')

const consoleLogOrigin = console.log

test('logger', async function (t) {
  t.plan(1)

  const Logger = require('../logger')
  console.log = (msg) => { throw new Error(`console.log called ${msg}`) }
  t.teardown(() => { console.log = consoleLogOrigin })

  const logger = new Logger({ labels: ['label-test'], level: Logger.INF })
  t.exception(() => logger.info('label-test', 'hello'), 'console.log called hello')
  logger.error('label-random', 'world')

  console.log = consoleLogOrigin
})
