'use strict'
const fs = require('fs')
const { spawn } = require('child_process')
const { isWindows, isBare } = require('which-runtime')
const { command } = require('paparam')
const Pipe = isBare
  ? require('bare-pipe')
  : class Pipe extends require('net').Socket { constructor (fd) { super({ fd }) } }
const { RUNTIME } = require('./constants')
const rundef = require('./cmd/run')
const pear = require('./cmd')
const onteardown = global.Bare ? require('./teardown') : noop
const program = global.Bare || global.process
const kIPC = Symbol('ipc')

class API {
  #ipc = null
  #state = null
  #unloading = null
  #teardown = null
  #teardowns = []
  #onteardown = null
  #refs = 0
  #exitCode = 0
  #pipe = null
  config = null
  argv = program.argv
  pid = program.pid
  static RTI = global.Pear?.constructor.RTI ?? null
  static IPC = kIPC
  static RUNTIME = RUNTIME
  static RUNTIME_ARGV = []
  constructor (ipc, state, { teardown = onteardown } = {}) {
    this.#ipc = ipc
    this.#state = state
    this.#refs = 0
    this.#teardown = new Promise((resolve) => { this.#unloading = resolve })
    this.#onteardown = teardown
    this.key = this.#state.key ? (this.#state.key.type === 'Buffer' ? Buffer.from(this.#state.key.data) : this.#state.key) : null
    this.config = state.config
    this.#onteardown(() => this.#unload())
    this.#ipc.unref()
  }

  get [kIPC] () { return this.#ipc }

  get worker () {
    console.error('[ DEPRECATED ] Pear.worker is deprecated and will be removed')
    const api = this
    return new class DeprecatedWorker {
      pipe () {
        console.error('[ DEPRECATED ] Pear.worker.pipe() is now Pear.pipe')
        return api.pipe
      }

      run (...args) {
        console.error('[ DEPRECATED ] Pear.worker.run() is now Pear.run()')
        return api.run(...args)
      }
    }()
  }

  #ref () {
    this.#refs++
    if (this.#refs === 1) {
      this.#ipc.ref()
    }
  }

  #unref () {
    this.#refs--
    if (this.#refs === 0) {
      this.#ipc.unref()
    }
  }

  async #unload () {
    this.#unloading()

    this.#teardowns.sort((a, b) => a.position - b.position)
    for (const teardown of this.#teardowns) this.#teardown = this.#teardown.then(teardown.fn)

    const MAX_TEARDOWN_WAIT = 15000
    let timeout = null
    let timedout = false
    let rejected = null
    const countdown = new Promise((resolve) => {
      timeout = setTimeout(() => {
        timedout = true
        resolve()
      }, MAX_TEARDOWN_WAIT)
    })
    this.#teardown.finally(() => { clearTimeout(timeout) })
    await Promise.race([this.#teardown, countdown]).catch((err) => {
      rejected = err
    })
    if (timedout || rejected) {
      if (timedout) console.error(`Max teardown wait reached after ${MAX_TEARDOWN_WAIT} ms. Exiting...`)
      if (rejected) console.error(`${rejected}. User teardown threw. Exiting...`)
      if (global.Bare) {
        global.Bare.exit()
      } else {
        const electron = require('electron')
        electron.ipcRenderer.send('app-exit') // graceful electron shutdown
      }
    }
  }

  async #reftrack (promise) {
    this.#ref()
    try {
      return await promise
    } finally {
      this.#unref()
    }
  }

  get pipe () {
    if (this.#pipe !== null) return this.#pipe
    const fd = 3
    try {
      const hasPipe = isWindows ? fs.fstatSync(fd).isFIFO() : fs.fstatSync(fd).isSocket()
      if (hasPipe === false) return null
    } catch {
      return null
    }
    const pipe = new Pipe(fd)
    pipe.on('end', () => {
      this.#onteardown(() => pipe.end(), Number.MAX_SAFE_INTEGER)
    })
    this.#pipe = pipe
    pipe.once('close', () => {
      this.#onteardown(() => program.exit(), Number.MAX_SAFE_INTEGER)
    })
    return pipe
  }

  run (link, args = []) {
    const { RUNTIME, RUNTIME_ARGV, RTI } = this.constructor
    const argv = pear(program.argv.slice(1)).rest
    const parser = command('run', ...rundef)
    const cmd = parser.parse(argv, { sync: true })
    const inject = [link]
    if (!cmd.flags.trusted) inject.unshift('--trusted')
    if (RTI.startId) inject.unshift('--parent', RTI.startId)
    argv.splice(cmd.indices.args.link, 1, ...inject)
    argv.unshift('run')
    let linksIndex = cmd.indices.flags.links
    const linksElements = linksIndex > 0 ? (cmd.flags.links === argv[linksIndex]) ? 2 : 1 : 0
    if (cmd.indices.flags.startId > 0) {
      argv.splice(cmd.indices.flags.startId, 1)
      if (linksIndex > cmd.indices.flags.startId) linksIndex -= linksElements
    }
    if (linksIndex > 0) argv.splice(linksIndex, linksElements)

    const sp = spawn(RUNTIME, [...RUNTIME_ARGV, ...argv, ...args], {
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

  message = (msg) => this.#reftrack(this.#ipc.message(msg))

  messages = (pattern, listener) => {
    if (typeof pattern === 'function') {
      listener = pattern
      pattern = {}
    }
    this.#ref()
    const subscriber = this.#ipc.messages(pattern)
    subscriber.on('close', () => this.#unref())
    if (typeof listener === 'function') subscriber.on('data', listener)
    return subscriber
  }

  checkpoint = (state) => {
    this.config.checkpoint = state
    return this.#reftrack(this.#ipc.checkpoint(state))
  }

  versions = () => this.#reftrack(this.#ipc.versions())

  updated = () => this.#reftrack(this.#ipc.updated())

  get = (key, opts = {}) => this.#reftrack(this.#ipc.get({ key, ...opts }))

  exists = (key) => this.#reftrack(this.#ipc.exists({ key }))

  compare = (keyA, keyB) => this.#reftrack(this.#ipc.compare({ keyA, keyB }))

  restart = async (opts = {}) => {
    if (this.#state.ui === null) throw new Error('Pear.restart is not supported for terminal apps')

    return this.#reftrack(this.#ipc.restart(opts))
  }

  reload = async (opts = {}) => {
    if (this.#state.ui === null) throw new Error('Pear.reload is not supported for terminal apps')
    if (opts.platform) throw new Error('Platform Pear.reload is not supported for desktop apps')

    global.location.reload()
  }

  updates = (listener) => this.messages({ type: 'pear/updates' }, listener)

  wakeups = (listener) => this.messages({ type: 'pear/wakeup' }, listener)

  teardown = (fn, position) => {
    if (typeof fn === 'function') this.#teardowns.push({ fn, position })
  }

  exit = (code) => program.exit(code)
  set exitCode (code) { this.#exitCode = code }
  get exitCode () { return this.#exitCode }

  asset = (link, opts = {}) => {
    this.#ref()
    const stream = this.#ipc.asset({ ...opts, link })
    stream.on('close', () => this.#unref())
    return stream
  }

  dump = (link, opts = {}) => {
    this.#ref()
    const stream = this.#ipc.dump({ ...opts, link })
    stream.on('close', () => this.#unref())
    return stream
  }

  stage = (link, opts = {}) => {
    this.#ref()
    const stream = this.#ipc.stage({ ...opts, link })
    stream.on('close', () => this.#unref())
    return stream
  }

  release = (link, opts = {}) => {
    this.#ref()
    const stream = this.#ipc.release({ ...opts, link })
    stream.on('close', () => this.#unref())
    return stream
  }

  info = (link, opts = {}) => {
    this.#ref()
    const stream = this.#ipc.info({ ...opts, link })
    stream.on('close', () => this.#unref())
    return stream
  }

  seed = (link, opts = {}) => {
    this.#ref()
    const stream = this.#ipc.seed({ ...opts, link })
    stream.on('close', () => { this.#unref() })
    return stream
  }
}

function noop () {}

module.exports = API
