'use strict'
const fs = require('fs')
const { spawn } = require('child_process')
const { isWindows, isBare } = require('which-runtime')
const { command } = require('paparam')
const b4a = require('b4a')
const Pipe = isBare
  ? require('bare-pipe')
  : class Pipe extends require('net').Socket { constructor (fd) { super({ fd }) } }
const hypercoreid = require('hypercore-id-encoding')
const { RUNTIME } = require('./constants')
const rundef = require('./cmd/run')
const pear = require('./cmd')
const onteardown = global.Bare ? require('./teardown') : noop
const plink = require('./link')
const program = global.Bare || global.process
const kIPC = Symbol('ipc')
const { ERR_INVALID_INPUT } = require('./errors')

let COMPAT = false

class API {
  #ipc = null
  #state = null
  #unloading = null
  #teardown = null
  #teardowns = []
  #onteardown = null
  #refs = 0
  #pipe = null
  app = null
  argv = program.argv
  pid = program.pid
  static RTI = global.Pear?.constructor.RTI ?? null
  static IPC = kIPC
  static RUNTIME = RUNTIME
  static RUNTIME_ARGV = []
  static set COMPAT (compat) {
    if (compat) Pear.app.tier = Pear.app.key ? 'production' : 'dev'
    return (COMPAT = compat)
  }

  static get COMPAT () { return COMPAT }
  static CUTOVER = true
  constructor (ipc, state, { teardown = onteardown } = {}) {
    this.#ipc = ipc
    this.#state = state
    this.#refs = 0
    this.#teardown = new Promise((resolve) => { this.#unloading = resolve })
    this.#onteardown = teardown
    this.key = this.#state.key ? (this.#state.key.type === 'Buffer' ? Buffer.from(this.#state.key.data) : this.#state.key) : null
    this.app = state.config
    this.#onteardown(() => this.#unload())
    this.#ipc.unref()
  }

  get config () {
    return this.app
  }

  set config (v) {
    return (this.app = v)
  }

  get [kIPC] () { return this.#ipc }

  get worker () {
    if (!this.constructor.COMPAT) console.error('[ DEPRECATED ] Pear.worker is deprecated and will be removed (use pear-run & pear-pipe)')
    const state = this.#state
    const ref = this.#ref.bind(this)
    const unref = this.#unref.bind(this)
    const settings = this.constructor
    return new class DeprecatedWorker {
      #pipe = null
      pipe () {
        if (!this.constructor.COMPAT) console.error('[ DEPRECATED ] Pear.worker.pipe() is now pear-pipe')
        if (this.#pipe !== null) return this.#pipe
        const fd = 3
        try {
          const hasPipe = isWindows ? fs.fstatSync(fd).isFIFO() : fs.fstatSync(fd).isSocket()
          if (hasPipe === false) return null
        } catch {
          return null
        }
        const pipe = new Pipe(fd)
        pipe.on('end', () => { Pear.exit() })
        pipe.once('close', () => { Pear.exit() })
        this.#pipe = pipe
        return pipe
      }

      run (link, args = []) {
        if (link.startsWith('pear://dev')) link = link.slice(0, 10)
        else if (link.startsWith('pear:dev')) link = link.slice(0, 8)
        const { RUNTIME, RUNTIME_ARGV, RTI } = settings
        const parsed = plink.parse(link)
        const { key, fork, length } = parsed.drive
        const { key: appKey } = state.applink ? (plink.parse(state.applink)).drive : {}
        if (appKey && key && b4a.equals(key, appKey) && fork === null && length === null) {
          link = `pear://${state.version?.fork}.${state.version?.length}.${hypercoreid.encode(key)}${parsed.pathname || ''}`
        }
        const argv = pear(program.argv.slice(1)).rest
        const parser = command('run', ...rundef)
        const cmd = parser.parse(argv, { sync: true })
        const inject = [link]
        if (!cmd.flags.trusted) inject.unshift('--trusted')
        if (RTI.startId) inject.unshift('--parent', RTI.startId)
        argv.length = cmd.indices.args.link
        argv.push(...inject)
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
        ref()
        sp.once('exit', (exitCode) => {
          if (exitCode !== 0) pipe.emit('crash', { exitCode })
          unref()
        })
        const pipe = sp.stdio[3]
        pipe.on('end', () => { pipe.end() })
        return pipe
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
    pipe.on('end', () => { Pear.exit() })
    pipe.once('close', () => { Pear.exit() })
    this.#pipe = pipe
    return pipe
  }

  run (link, args = []) {
    if (link.startsWith('pear://dev')) link = link.slice(0, 10)
    else if (link.startsWith('pear:dev')) link = link.slice(0, 8)
    const { RUNTIME, RUNTIME_ARGV, RTI } = this.constructor
    const parsed = plink.parse(link)
    const { key, fork, length } = parsed.drive
    const { key: appKey } = this.#state.applink ? (plink.parse(this.#state.applink)).drive : {}
    if (appKey && key && b4a.equals(key, appKey) && fork === null && length === null) {
      link = `pear://${this.#state.version?.fork}.${this.#state.version?.length}.${hypercoreid.encode(key)}${parsed.pathname || ''}`
    }
    const argv = pear(program.argv.slice(1)).rest
    const parser = command('run', ...rundef)
    const cmd = parser.parse(argv, { sync: true })
    const inject = [link]
    if (!cmd.flags.trusted) inject.unshift('--trusted')
    if (RTI.startId) inject.unshift('--parent', RTI.startId)
    argv.length = cmd.indices.args.link
    argv.push(...inject)
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
    pipe.on('end', () => pipe.end())
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
    this.app.checkpoint = state
    return this.#reftrack(this.#ipc.checkpoint(state))
  }

  versions = () => this.#reftrack(this.#ipc.versions())

  updated = () => {
    if (typeof this.#ipc.updated === 'function') return this.#reftrack(this.#ipc.updated())
    return Promise.resolve()
  }

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

  teardown = (fn = () => {}, position = 0) => {
    if (typeof fn !== 'function') throw ERR_INVALID_INPUT('teardown expects function')

    const isValidPosition = Number.isInteger(position) || position === Infinity || position === -Infinity
    if (!isValidPosition) throw ERR_INVALID_INPUT('teardown position must be integer')

    this.#teardowns.push({ fn, position })
  }

  exit = (code) => {
    program.exitCode = code
    this.#unload().finally(() => {
      return program.exit(code)
    })
  }

  set exitCode (code) { program.exitCode = code }
  get exitCode () { return program.exitCode }

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
