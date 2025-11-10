'use strict'
const ref = require('pear-ref')
const run = require('pear-run')
const pipe = require('pear-pipe')
const wakeups = require('pear-wakeups')
const updates = require('pear-updates')
const message = require('pear-message')
const messages = require('pear-messages')
const { ERR_INVALID_INPUT } = require('pear-errors')
const { RUNTIME } = require('pear-constants')
const onteardown = global.Bare ? require('pear-gracedown') : noop
const program = global.Bare || global.process
const kIPC = Symbol('ipc')
const kREF = Symbol('ref')

let COMPAT = false

class API {
  #ipc = null
  #state = null
  #unloading = null
  #teardown = null
  #teardowns = []
  #onteardown = null
  app = null
  argv = program.argv
  pid = program.pid
  static RTI = global.Pear?.constructor.RTI ?? null
  static IPC = kIPC
  static REF = kREF
  static RUNTIME = RUNTIME
  static RUNTIME_ARGV = []
  static RUNTIME_FLAGS = []
  static set COMPAT(compat) {
    if (compat) Pear.app.tier = Pear.app.key ? 'production' : 'dev'
    return (COMPAT = compat)
  }

  static get COMPAT() {
    return COMPAT
  }
  static CUTOVER = true
  constructor(ipc, state, { teardown = onteardown } = {}) {
    this.#ipc = ipc
    this.#state = state
    this.#teardown = new Promise((resolve) => {
      this.#unloading = resolve
    })
    this.#onteardown = teardown
    this.key = this.#state.key
      ? this.#state.key.type === 'Buffer'
        ? Buffer.from(this.#state.key.data)
        : this.#state.key
      : null
    this.app = state.config
    this.#onteardown(() => this.#unload())
    this.#ipc.unref()
    ref.on('ref', (refs) => {
      if (refs === 1) this.#ipc.ref()
    })
    ref.on('unref', (refs) => {
      if (refs === 0) this.#ipc.unref()
    })
  }

  get config() {
    return this.app
  }

  set config(v) {
    return (this.app = v)
  }

  get [kIPC]() {
    return this.#ipc
  }
  get [kREF]() {
    return ref
  }

  get worker() {
    if (!this.constructor.COMPAT)
      console.error(
        '[ DEPRECATED ] Pear.worker is deprecated and will be removed. Use pear-run & pear-pipe'
      )
    return new (class DeprecatedWorker {
      pipe() {
        if (!this.constructor.COMPAT)
          console.error(
            '[ DEPRECATED ] Pear.worker.pipe() is deprecated. Use pear-pipe'
          )
        return pipe()
      }

      run(link, args = []) {
        if (!this.constructor.COMPAT)
          console.error(
            '[ DEPRECATED ] Pear.worker.run() is deprecated. Use pear-run'
          )
        return run(link, args)
      }
    })()
  }

  checkpoint = (state) => {
    this.app.checkpoint = state
    return ref.track(this.#ipc.checkpoint(state))
  }

  restart = async (opts = {}) => {
    if (!this.constructor.COMPAT)
      console.error(
        '[ DEPRECATED ] Pear.restart is deprecated and will be removed. Use pear-restart'
      )
    if (this.#state.ui === null)
      throw new Error('Pear.restart is not supported for terminal apps')
    return ref.track(this.#ipc.restart(opts))
  }

  teardown = (fn = () => {}, position = 0) => {
    if (typeof fn !== 'function')
      throw ERR_INVALID_INPUT('teardown expects function')

    const isValidPosition =
      Number.isInteger(position) ||
      position === Infinity ||
      position === -Infinity
    if (!isValidPosition)
      throw ERR_INVALID_INPUT('teardown position must be integer')

    this.#teardowns.push({ fn, position })
  }

  versions = () => ref.track(this.#ipc.versions())

  set exitCode(code) {
    program.exitCode = code
  }
  get exitCode() {
    return program.exitCode
  }

  exit = (code) => {
    program.exitCode = code
    this.#unload().finally(() => {
      return program.exit(code)
    })
  }

  async #unload() {
    this.#unloading()

    this.#teardowns.sort((a, b) => a.position - b.position)
    for (const teardown of this.#teardowns)
      this.#teardown = this.#teardown.then(teardown.fn)

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
    this.#teardown.finally(() => {
      clearTimeout(timeout)
    })
    await Promise.race([this.#teardown, countdown]).catch((err) => {
      rejected = err
    })
    if (timedout || rejected) {
      if (timedout)
        console.error(
          `Max teardown wait reached after ${MAX_TEARDOWN_WAIT} ms. Exiting...`
        )
      if (rejected)
        console.error(`${rejected}. User teardown threw. Exiting...`)
      if (global.Bare) {
        global.Bare.exit()
      } else {
        const electron = require('electron')
        electron.ipcRenderer.send('app-exit') // graceful electron shutdown
      }
    }
  }

  message = (msg) => {
    if (!this.constructor.COMPAT)
      console.error(
        '[ DEPRECATED ] Pear.message is deprecated and will be removed. Use pear-message'
      )
    return message(msg)
  }

  messages = (pattern, listener) => {
    if (!this.constructor.COMPAT)
      console.error(
        '[ DEPRECATED ] Pear.messages is deprecated and will be removed. Use pear-messages'
      )
    return messages(pattern, listener)
  }

  updated = () => {
    if (!this.constructor.COMPAT)
      console.error(
        '[ DEPRECATED ] Pear.updated is deprecated and will be removed. It is now a no-op & can be removed from code.'
      )
    if (typeof this.#ipc.updated === 'function')
      return ref.track(this.#ipc.updated())
    return Promise.resolve()
  }

  reload = async (opts = {}) => {
    if (!this.constructor.COMPAT)
      console.error(
        '[ DEPRECATED ] Pear.reload is deprecated and will be removed. Use location.reload.'
      )
    if (this.#state.ui === null)
      throw new Error('Pear.reload is not supported for terminal apps')
    if (opts.platform)
      throw new Error('Platform Pear.reload is not supported for desktop apps')
    global.location.reload()
  }

  updates = (listener) => {
    if (!this.constructor.COMPAT)
      console.error(
        '[ DEPRECATED ] Pear.updates is deprecated and will be removed. Use pear-updates'
      )
    return updates(listener)
  }

  wakeups = (listener) => {
    if (!this.constructor.COMPAT)
      console.error(
        '[ DEPRECATED ] Pear.wakeups is deprecated and will be removed. Use pear-wakeups'
      )
    return wakeups(listener)
  }
}

function noop() {}

module.exports = API
