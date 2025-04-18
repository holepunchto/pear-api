'use strict'
const fs = require('fs')
const { spawn } = require('child_process')
const { isWindows, isBare } = require('which-runtime')
const { command } = require('paparam')
const Pipe = isBare
  ? require('bare-pipe')
  : class Pipe extends require('net').Socket { constructor (fd) { super({ fd }) } }
const teardown = isBare ? require('./teardown') : (fn) => fn()
const { RUNTIME } = require('./constants')
const rundef = require('./cmd/run')
const noop = Function.prototype

class Worker {
  #pipe = null
  #ref = null
  #unref = null
  static RUNTIME = RUNTIME
  static RUNTIME_ARGV = []
  constructor ({ ref, unref } = {}) {
    this.#ref = ref ?? noop
    this.#unref = unref ?? noop
  }

  #args (link) {
    if (Array.isArray(link)) return ['run', '--trusted', ...link]
    const parser = command('pear', command('run', ...rundef))
    const argv = ['run', ...global.Bare.argv.slice(2)]
    const cmd = parser.parse(argv, { sync: true })
    const args = argv.map((arg) => arg === cmd.args.link ? link : arg)
    if (cmd.indices.rest > 0) args.splice(cmd.indices.rest)
    let linksIndex = cmd.indices.flags.links
    const linksElements = linksIndex > 0 ? (cmd.flags.links === args[linksIndex]) ? 2 : 1 : 0
    if (cmd.indices.flags.startId > 0) {
      args.splice(cmd.indices.flags.startId, 1)
      if (linksIndex > cmd.indices.flags.startId) linksIndex -= linksElements
    }
    if (linksIndex > 0) args.splice(linksIndex, linksElements)
    if (!cmd.flags.trusted) args.splice(1, 0, '--trusted')
    return args
  }

  run (link, args = []) {
    args = [...this.constructor.RUNTIME_ARGV, ...this.#args(link), ...args]
    const sp = spawn(this.constructor.RUNTIME, args, {
      stdio: ['inherit', 'inherit', 'inherit', 'overlapped'],
      windowsHide: true
    })
    this.#ref()
    sp.once('exit', (exitCode) => {
      if (exitCode !== 0) pipe.emit('crash', { exitCode })
      this.#unref()
    })
    const pipe = sp.stdio[3]
    return pipe
  }

  pipe () {
    if (this.#pipe) return this.#pipe
    const fd = 3
    try {
      const isWorker = isWindows ? fs.fstatSync(fd).isFIFO() : fs.fstatSync(fd).isSocket()
      if (isWorker === false) return null
    } catch {
      return null
    }
    const pipe = new Pipe(fd)
    pipe.on('end', () => {
      teardown(() => pipe.end(), Number.MAX_SAFE_INTEGER)
    })
    this.#pipe = pipe
    pipe.once('close', () => {
      teardown(() => global.Bare.exit(), Number.MAX_SAFE_INTEGER)
    })
    return pipe
  }
}

module.exports = Worker
