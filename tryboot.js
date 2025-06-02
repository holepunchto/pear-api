'use strict'
const daemon = require('bare-daemon')
const { RUNTIME, PLATFORM_DIR } = require('./constants')
const pear = require('./cmd')

module.exports = function tryboot () {
  const { argv } = global.Bare || global.process
  const { flags = {} } = pear(argv.slice(1)) ?? {}
  const args = ['--sidecar']
  const dhtBootstrap = argv.includes('--dht-bootstrap') ? argv[argv.indexOf('--dht-bootstrap') + 1] : null
  if (dhtBootstrap) {
    args.push('--dht-bootstrap')
    args.push(dhtBootstrap)
  }
  let log = false
  if (flags.log) {
    args.push('--log')
    log = true
  } else {
    const { length } = args
    if (flags.logLevel) args.push('--log-level', flags.logLevel)
    if (flags.logFields) args.push('--log-fields', flags.logFields)
    if (flags.logLabels) args.push('--log-labels', flags.logLabels)
    if (args.length > length) log = true
  }
  if (flags.logStacks) args.push('--log-stacks')
  daemon.spawn(RUNTIME, args, { stdio: log ? 'inherit' : 'ignore', cwd: PLATFORM_DIR })
}
