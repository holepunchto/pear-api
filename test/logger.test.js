'use strict'

const { test } = require('brittle')
const Logger = require('../logger')

const consoleLogOrigin = console.log
const consoleErrorOrigin = console.error

test('logger level OFF', async function (t) {
  t.plan(2)

  const Logger = require('../logger')

  let consoleLogCount = 0
  console.log = () => { consoleLogCount += 1 }
  t.teardown(() => { console.log = consoleLogOrigin })

  let consoleErrorCount = 0
  console.error = () => { consoleErrorCount += 1 }
  t.teardown(() => { console.error = consoleErrorOrigin })

  const logger = new Logger({ labels: ['label-test'], level: Logger.OFF })
  try {
    logger.error('label-test', 'error')
    logger.info('label-test', 'info')
    logger.trace('label-test', 'trace')
  } finally {
    console.log = consoleLogOrigin
    console.error = consoleErrorOrigin
  }

  t.is(consoleLogCount, 0, 'console.log not called')
  t.is(consoleErrorCount, 0, 'console.error not called')
})

test('logger level ERR', async function (t) {
  t.plan(2)

  const Logger = require('../logger')

  let consoleLogCount = 0
  console.log = () => { consoleLogCount += 1 }
  t.teardown(() => { console.log = consoleLogOrigin })

  let consoleErrorCount = 0
  console.error = () => { consoleErrorCount += 1 }
  t.teardown(() => { console.error = consoleErrorOrigin })

  const logger = new Logger({ labels: ['label-test'], level: Logger.ERR })
  try {
    logger.error('label-test', 'error')
    logger.info('label-test', 'info')
    logger.trace('label-test', 'trace')
  } finally {
    console.log = consoleLogOrigin
    console.error = consoleErrorOrigin
  }

  t.is(consoleLogCount, 0, 'console.log not called')
  t.is(consoleErrorCount, 1, 'console.error called once')
})

test('logger level INF', async function (t) {
  t.plan(2)

  const Logger = require('../logger')

  let consoleLogCount = 0
  console.log = () => { consoleLogCount += 1 }
  t.teardown(() => { console.log = consoleLogOrigin })

  let consoleErrorCount = 0
  console.error = () => { consoleErrorCount += 1 }
  t.teardown(() => { console.error = consoleErrorOrigin })

  const logger = new Logger({ labels: ['label-test'], level: Logger.INF })
  try {
    logger.error('label-test', 'error')
    logger.info('label-test', 'info')
    logger.trace('label-test', 'trace')
  } finally {
    console.log = consoleLogOrigin
    console.error = consoleErrorOrigin
  }

  t.is(consoleLogCount, 1, 'console.log called once')
  t.is(consoleErrorCount, 1, 'console.error called once')
})

test('logger level TRC', async function (t) {
  t.plan(2)

  const Logger = require('../logger')

  let consoleLogCount = 0
  console.log = () => { consoleLogCount += 1 }
  t.teardown(() => { console.log = consoleLogOrigin })

  let consoleErrorCount = 0
  console.error = () => { consoleErrorCount += 1 }
  t.teardown(() => { console.error = consoleErrorOrigin })

  const logger = new Logger({ labels: ['label-test'], level: Logger.TRC })
  try {
    logger.error('label-test', 'error')
    logger.info('label-test', 'info')
    logger.trace('label-test', 'trace')
  } finally {
    console.log = consoleLogOrigin
    console.error = consoleErrorOrigin
  }

  t.is(consoleLogCount, 1, 'console.log called once')
  t.is(consoleErrorCount, 2, 'console.error called twice')
})

test('logger with matching label', async function (t) {
  t.plan(2)

  let consoleLogCount = 0
  console.log = () => { consoleLogCount += 1 }
  t.teardown(() => { console.log = consoleLogOrigin })

  let consoleErrorCount = 0
  console.error = () => { consoleErrorCount += 1 }
  t.teardown(() => { console.error = consoleErrorOrigin })

  const logger = new Logger({ labels: ['label-test'], level: Logger.TRC })
  try {
    logger.error('label-test', 'error')
    logger.info('label-test', 'info')
    logger.trace('label-test', 'trace')
  } finally {
    console.log = consoleLogOrigin
    console.error = consoleErrorOrigin
  }

  t.is(consoleLogCount, 1, 'console.log called once for matching label')
  t.is(consoleErrorCount, 2, 'console.error called twice for matching label')
})

test('logger with non-matching label', async function (t) {
  t.plan(2)

  let consoleLogCount = 0
  console.log = () => { consoleLogCount += 1 }
  t.teardown(() => { console.log = consoleLogOrigin })

  let consoleErrorCount = 0
  console.error = () => { consoleErrorCount += 1 }
  t.teardown(() => { console.error = consoleErrorOrigin })

  const logger = new Logger({ labels: ['label-test'], level: Logger.TRC })
  try {
    logger.error('non-matching-label', 'error')
    logger.info('non-matching-label', 'info')
    logger.trace('non-matching-label', 'trace')
  } finally {
    console.log = consoleLogOrigin
    console.error = consoleErrorOrigin
  }

  t.is(consoleLogCount, 0, 'console.log not called for non-matching label')
  t.is(consoleErrorCount, 0, 'console.error not called for non-matching label')
})

test('logger with multiple labels', async function (t) {
  t.plan(2)

  let consoleLogCount = 0
  console.log = () => { consoleLogCount += 1 }
  t.teardown(() => { console.log = consoleLogOrigin })

  let consoleErrorCount = 0
  console.error = () => { consoleErrorCount += 1 }
  t.teardown(() => { console.error = consoleErrorOrigin })

  const logger = new Logger({ labels: ['label-test', 'label-extra'], level: Logger.TRC })
  try {
    logger.error('label-test', 'error')
    logger.info('label-extra', 'info')
    logger.trace('non-matching-label', 'trace')
  } finally {
    console.log = consoleLogOrigin
    console.error = consoleErrorOrigin
  }

  t.is(consoleLogCount, 1, 'console.log called once for matching labels')
  t.is(consoleErrorCount, 1, 'console.error called once for matching labels')
})
