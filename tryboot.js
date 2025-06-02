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

  daemon.spawn(RUNTIME, args, { cwd: PLATFORM_DIR })
}
