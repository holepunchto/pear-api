'use strict'
const { isBare, platform, arch } = require('which-runtime')
const fs = require('fs')
const path = require('path')
const { CHECKOUT } = require('pear-rti')
const pid = isBare ? global.Bare.pid : process.pid

let hasLoggedUnhandledRejection = false
let hasLoggedUncaughtException = false

const start = Date.now()
function logCrash (logPath, errorInfo, stackTrace, err) {
  const timeStamp = (new Date()).toISOString()
  const uptime = (Date.now() - start) / 1000
  const driveInfo = `key=${CHECKOUT.key}\nlength=${CHECKOUT.length}\nfork=${CHECKOUT.fork}`
  const processInfo = `platform=${platform}\narch=${arch}\npid=${pid}\nuptime=${uptime}s`
  const errInfo = err !== null && typeof err === 'object' ? JSON.stringify(err, 0, 4).slice(1, -2) : ''
  const errorMsg = `${timeStamp} ${errorInfo}\n${driveInfo}\n${processInfo}\nstack=${stackTrace + errInfo}\n\n`

  console.error(errorMsg)
  fs.writeFileSync(logPath, errorMsg, { flag: 'a', encoding: 'utf8' })

  console.error(`Error logged at ${logPath}`)
}

function printCrash (errorInfo, stackTrace, err) {
  const errInfo = err !== null && typeof err === 'object' ? JSON.stringify(err, 0, 4).slice(1, -2) : ''
  const errorMsg = `${stackTrace + errInfo}\n\n${errorInfo}`

  console.error(errorMsg)
}

function logAndExit (enableLog, logPath, errorInfo, stack, err) {
  if (enableLog) {
    logCrash(logPath, errorInfo, stack, err)
  } else {
    printCrash(errorInfo, stack, err)
  }

  const program = isBare ? global.Bare : (global.process.versions.electron ? require('electron').app : global.process)
  program.exit(1)
}

function setupCrashHandlers (processName, swap, enableLog) {
  const crashlogPath = path.join(swap, `${processName}.crash.log`)
  const runContext = isBare ? global.Bare : global.process

  runContext.on('unhandledRejection', (reason) => {
    if (hasLoggedUnhandledRejection) return
    hasLoggedUnhandledRejection = true

    const stack = reason?.stack || reason || ''
    const errorInfo = `${processName} exiting due to unhandled rejection`
    logAndExit(enableLog, crashlogPath, errorInfo, stack, reason)
  })

  runContext.on('uncaughtException', (err) => {
    if (hasLoggedUncaughtException) return
    hasLoggedUncaughtException = true

    const errorInfo = `${processName} exiting due to uncaught exception`
    logAndExit(enableLog, crashlogPath, errorInfo, err.stack, err)
  })
}

module.exports = setupCrashHandlers
