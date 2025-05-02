'use strict'
const fs = require('fs')
const { spawn } = require('child_process')
const { Duplex } = require('streamx')
const { isBare } = require('which-runtime')
const { command } = require('paparam')
const BarePipe = isBare ? require('bare-pipe') : null
const teardown = isBare ? require('./teardown') : (fn) => fn()
const { RUNTIME } = require('./constants')
const rundef = require('./cmd/run')
const peardef = require('./cmd')
const noop = Function.prototype

class Worker {
  #pipe = null
  #ref = null
  #unref = null
  static RUNTIME = RUNTIME
  static RUNTIME_ARGV = []
  static Pipe = class Pipe extends Duplex {
    constructor (io, opts) {
      if (Array.isArray(io) === false) return new BarePipe(io, opts)
      super()
      this._incoming = isBare ? new BarePipe(io[0]) : fs.createReadStream(null, { fd: io[0] })
      this._outgoing = isBare ? new BarePipe(io[1]) : fs.createWriteStream(null, { fd: io[1] })

      this._pendingWrite = null

      this._incoming
        .on('data', this._ondata.bind(this))
        .on('end', this._onend.bind(this))
        .pause()

      this._outgoing.on('drain', this._ondrain.bind(this))
    }

    ref () {
      this._incoming.ref()
      this._outgoing.ref()
    }

    unref () {
      this._incoming.unref()
      this._outgoing.unref()
    }

    _read () {
      this._incoming.resume()
    }

    _write (chunk, cb) {
      if (this._outgoing.write(chunk)) cb(null)
      else this._pendingWrite = cb
    }

    _final (cb) {
      this.outgoing.end()
      cb(null)
    }

    _predestroy () {
      this._incoming.destroy()
      this._outgoing.destroy()
    }

    _ondata (data) {
      if (this.push(data) === false) this._incoming.pause()
    }

    _onend () {
      this.push(null)
    }

    _ondrain () {
      if (this._pendingWrite === null) return
      const cb = this._pendingWrite
      this._pendingWrite = null
      cb(null)
    }
  }

  constructor ({ ref, unref } = {}) {
    this.#ref = ref ?? noop
    this.#unref = unref ?? noop
  }

  #args (link) {
    if (Array.isArray(link)) return ['run', '--trusted', ...link]
    const { rest } = peardef().parse(global.Bare.argv.slice(1))
    const argv = ['run', ...rest]
    const parser = command('pear', command('run', ...rundef))
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
    try {
      const stat = fs.fstatSync(3)
      const hasPipe = stat.isFIFO() ?? stat.isSocket()
      if (hasPipe === false) return null
    } catch {
      return null
    }
    const pipe = new this.constructor.Pipe(isBare ? 3 : [4, 3])
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
