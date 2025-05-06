'use strict'
/* global Bare */
const { isWindows, isBare } = require('which-runtime')
const Pipe = isBare ? require('bare-pipe') : undefined
const readline = require('readline')
const tty = require('tty')
const fs = require('fs')
const { Writable, Readable } = require('streamx')
const { once } = require('events')
const hypercoreid = require('hypercore-id-encoding')
const byteSize = require('tiny-byte-size')
const process = require('process')
const { CHECKOUT } = require('./constants')
const teardown = isBare ? require('./teardown') : () => {}
const opwait = require('./opwait')
const checkTTY = (fd) => isBare ? tty.isTTY(fd) : tty.isatty(fd)
const isTTY = checkTTY(0)

const pt = (arg) => arg
const es = () => ''
const ansi = isWindows
  ? { bold: pt, dim: pt, italic: pt, underline: pt, inverse: pt, red: pt, green: pt, yellow: pt, gray: pt, upHome: es, link: pt, hideCursor: es, showCursor: es }
  : {
      bold: (s) => `\x1B[1m${s}\x1B[22m`,
      dim: (s) => `\x1B[2m${s}\x1B[22m`,
      italic: (s) => `\x1B[3m${s}\x1B[23m`,
      underline: (s) => `\x1B[4m${s}\x1B[24m`,
      inverse: (s) => `\x1B[7m${s}\x1B[27m`,
      red: (s) => `\x1B[31m${s}\x1B[39m`,
      green: (s) => `\x1B[32m${s}\x1B[39m`,
      yellow: (s) => `\x1B[33m${s}\x1B[39m`,
      gray: (s) => `\x1B[90m${s}\x1B[39m`,
      upHome: (n = 1) => `\x1B[${n}F`,
      link: (url, text = url) => `\x1B]8;;${url}\x07${text}\x1B]8;;\x07`,
      hideCursor: () => '\x1B[?25l',
      showCursor: () => '\x1B[?25h'
    }

ansi.sep = isWindows ? '-' : ansi.dim(ansi.green('∞'))
ansi.tick = isWindows ? '^' : ansi.green('✔')
ansi.cross = isWindows ? 'x' : ansi.red('✖')
ansi.warning = isWindows ? '!' : '⚠️'
ansi.pear = isWindows ? '*' : '🍐'
ansi.dot = isWindows ? '•' : 'o'
ansi.key = isWindows ? '>' : '🔑'
ansi.down = isWindows ? '↓' : '⬇'
ansi.up = isWindows ? '↑' : '⬆'

const stdio = new class Stdio {
  drained = Writable.drained
  constructor () {
    this._in = null
    this._out = null
    this._err = null
    this.rawMode = false
  }

  get inAttached () { return this._in !== null }

  get in () {
    if (this._in === null) {
      this._in = checkTTY(0) ? new tty.ReadStream(0) : (isBare ? new Pipe(0) : fs.createReadStream('/dev/stdin', { fd: 0 }))
      this._in.once('close', () => { this._in = null })
    }
    return this._in
  }

  get out () {
    if (this._out === null) this._out = checkTTY(1) ? new tty.WriteStream(1) : (isBare ? new Pipe(1) : fs.createWriteStream('/dev/stdout', { fd: 1 }))
    return this._out
  }

  get err () {
    if (this._err === null) this._err = checkTTY(2) ? new tty.WriteStream(2) : (isBare ? new Pipe(2) : fs.createWriteStream('/dev/stderr', { fd: 2 }))
    return this._err
  }

  size () {
    if (!this.out.getWindowSize) return [80, 80]
    const [width, height] = this.out.getWindowSize()
    return { width, height }
  }

  raw (rawMode) {
    this.rawMode = !!rawMode
    return this.in.setMode(this.rawMode ? this.tty.constants.MODE_RAW : this.tty.constants.MODE_NORMAL)
  }
}()

class Interact {
  static rx = /[\x1B\x9B][[\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\d/#&.:=?%@~_]+)*|[a-zA-Z\d]+(?:;[-a-zA-Z\d/#&.:=?%@~_]*)*)?\x07)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g // eslint-disable-line no-control-regex
  constructor (header, params, opts = {}) {
    this._header = header
    this._params = params
    this._defaults = opts.defaults || {}

    const mask = (data, cb) => {
      if (data.length > 4) { // is full line
        const prompt = this._rl._prompt
        const regex = new RegExp(`(${prompt})([\\x20-\\x7E]+)`, 'g') // match printable chars after prompt
        const masked = data.toString().replace(regex, (_, prompt, pwd) => prompt + '*'.repeat(pwd.length))
        stdio.out.write(masked)
      } else {
        stdio.out.write(data)
      }
      cb(null)
    }

    this._rl = readline.createInterface({
      input: stdio.in,
      output: opts.masked ? new Writable({ write: mask }) : stdio.out
    })

    this._rl.input?.setMode(tty.constants?.MODE_RAW)
    this._rl.on('close', () => {
      console.log() // new line
      process.exit()
    })
  }

  async run (opts) {
    try {
      return await this.#run(opts)
    } finally {
      if (stdio.inAttached) stdio.in.destroy()
    }
  }

  async #run (opts = {}) {
    if (opts.autosubmit) return this.#autosubmit()
    stdio.out.write(this._header)
    const fields = {}
    const shave = {}
    const defaults = this._defaults
    while (this._params.length) {
      const param = this._params.shift()
      while (true) {
        const deflt = defaults[param.name] ?? param.default
        let answer = await this.#input(`${param.prompt}${param.delim || ':'}${deflt && ' (' + deflt + ')'} `)

        if (answer.length === 0) answer = defaults[param.name] ?? deflt
        if (!param.validation || await param.validation(answer)) {
          if (typeof answer === 'string') answer = answer.replace(this.constructor.rx, '')
          fields[param.name] = answer
          if (Array.isArray(param.shave) && param.shave.every((ix) => typeof ix === 'number')) shave[param.name] = param.shave
          break
        } else {
          stdio.out.write(param.msg + '\n')
        }
      }
    }
    return { fields, shave }
  }

  #autosubmit () {
    const fields = {}
    const shave = {}
    const defaults = this._defaults
    while (this._params.length) {
      const param = this._params.shift()
      fields[param.name] = defaults[param.name] ?? param.default
      if (Array.isArray(param.shave) && param.shave.every((ix) => typeof ix === 'number')) shave[param.name] = param.shave
    }
    return { fields, shave }
  }

  async #input (prompt) {
    stdio.out.write(prompt)
    this._rl._prompt = prompt
    const answer = (await once(this._rl, 'data')).toString()
    return answer.trim() // remove return char
  }
}

let statusFrag = ''

function status (msg, success) {
  msg = msg || ''
  const done = typeof success === 'boolean'
  if (msg) stdio.out.write(`\x1B[2K\r${indicator(success)}${msg}\n${done ? '' : ansi.upHome()}`)
  statusFrag = msg.slice(0, 3)
}

function print (message, success) {
  statusFrag = ''
  console.log(`${typeof success !== 'undefined' ? indicator(success) : ''}${message}`)
}

function byteDiff ({ type, sizes, message }) {
  statusFrag = ''
  sizes = sizes.map((size) => (size > 0 ? '+' : '') + byteSize(size)).join(', ')
  print(indicator(type, 'diff') + ' ' + message + ' (' + sizes + ')')
}

function indicator (value, type = 'success') {
  if (value === undefined) return ''
  if (value === true) value = 1
  else if (value === false) value = -1
  else if (value == null) value = 0
  if (type === 'diff') return value === 0 ? ansi.yellow('~') : (value === 1 ? ansi.green('+') : ansi.red('-'))
  return value < 0 ? ansi.cross + ' ' : (value > 0 ? ansi.tick + ' ' : ansi.gray('- '))
}

const outputter = (cmd, taggers = {}) => (opts, stream, info = {}, ipc) => {
  if (Array.isArray(stream)) stream = Readable.from(stream)
  if (isTTY) stdio.out.write(ansi.hideCursor())
  const dereg = isTTY
    ? teardown(() => {
      if (!isWindows) stdio.out.write('\x1B[1K\x1B[G' + statusFrag) // clear ^C
      stdio.out.write(ansi.showCursor())
    })
    : null
  if (typeof opts === 'boolean') opts = { json: opts }
  const { json = false, log } = opts
  const promise = opwait(stream, ({ tag, data }) => {
    if (json) {
      const str = JSON.stringify({ cmd, tag, data })
      if (log) log(str)
      else print(str)
      return
    }
    const transform = Promise.resolve(typeof taggers[tag] === 'function' ? taggers[tag](data, info, ipc) : taggers[tag] || false)
    transform.then((result) => {
      if (result === undefined) return
      if (typeof result === 'string') result = { output: 'print', message: result }
      if (result === false) {
        if (tag === 'final') result = { output: 'print', message: data.success ? 'Success' : 'Failure' }
        else result = {}
      }
      result.success = result.success ?? data?.success
      const { output, message, success = data?.success } = result
      if (log) {
        const logOpts = { output, ...(typeof success === 'boolean' ? { success } : {}) }
        if (Array.isArray(message) === false) log(message, logOpts)
        else for (const msg of message) log(msg, logOpts)
        return
      }
      let msg = Array.isArray(message) ? message.join('\n') : message
      if (tag === 'final') msg += '\n'
      if (output === 'print') print(msg, success)
      if (output === 'status') status(msg, success)
    }, (err) => stream.destroy(err))
  })

  return !isTTY
    ? promise
    : promise.finally(() => {
      stdio.out.write(ansi.showCursor())
      dereg()
    })
}

const banner = `${ansi.bold('Pear')} ~ ${ansi.dim('Welcome to the Internet of Peers')}`
const version = `${CHECKOUT.fork || 0}.${CHECKOUT.length || 'dev'}.${CHECKOUT.key}`
const header = `  ${banner}
  ${ansi.pear + ' '}${ansi.bold(ansi.gray('v' + version))}
`
const urls = ansi.link('https://pears.com', 'pears.com') + ' | ' + ansi.link('https://holepunch.to', 'holepunch.to') + ' | ' + ansi.link('https://keet.io', 'keet.io')

const footer = {
  overview: `  ${ansi.bold('Legend:')} [arg] = optional, <arg> = required, | = or \n  Run ${ansi.bold('pear help')} to output full help for all commands\n  For command help: ${ansi.bold('pear help [cmd]')} or ${ansi.bold('pear [cmd] -h')}\n
${ansi.pear + ' '}${version}\n${urls}\n${ansi.bold(ansi.dim('Pear'))} ~ ${ansi.dim('Welcome to the IoP')}`,
  help: `${ansi.pear + ' '}${version}
${urls}\n${ansi.bold(ansi.dim('Pear'))} ~ ${ansi.dim('Welcome to the IoP')}
  `
}

const usage = { header, version, banner, footer }

async function trust (ipc, key, cmd) {
  const explain = {
    run: 'Be sure that software is trusted before running it\n' +
      '\nType "TRUST" to allow execution or anything else to exit\n\n',
    init: 'This template is not trusted.\n' +
      '\nType "TRUST" to trust this template, or anything else to exit\n\n'
  }

  const act = {
    run: 'Use pear run again to execute trusted application',
    init: 'Use pear init again to initalize from trusted template'
  }

  const ask = {
    run: 'Trust application',
    init: 'Trust template'
  }

  const z32 = hypercoreid.encode(key)
  const dialog = ansi.cross + ' Key pear://' + z32 + ' is not known\n\n' + explain[cmd]
  const delim = '?'
  const validation = (value) => value === 'TRUST'
  const msg = '\n' + ansi.cross + ' uppercase TRUST to confirm\n'

  const interact = new Interact(dialog, [
    {
      name: 'value',
      default: '',
      prompt: ask[cmd],
      delim,
      validation,
      msg
    }
  ])

  await interact.run()
  await ipc.permit({ key })
  print('\n' + ansi.tick + ' pear://' + z32 + ' is now trusted\n')
  print(act[cmd] + '\n')
  await ipc.close()
  process.exit()
}

async function password (ipc, key, cmd) {
  const z32 = hypercoreid.normalize(key)

  const explain = {
    run: 'pear://' + z32 + ' is an encrypted application. \n' +
      '\nEnter the password to run the app.\n\n',
    stage: 'This application is encrypted.\n' +
        '\nEnter the password to stage the app.\n\n',
    seed: 'This application is encrypted.\n' +
        '\nEnter the password to seed the app.\n\n',
    dump: 'This application is encrypted.\n' +
        '\nEnter the password to dump the app.\n\n',
    init: 'This template is encrypted.\n' +
      '\nEnter the password to init from the template.\n\n',
    info: 'This application is encrypted.\n' +
      '\nEnter the password to retrieve info.\n\n'
  }

  const message = {
    run: 'Added encryption key for pear://' + z32,
    stage: 'Added encryption key, run stage again to complete it.',
    seed: 'Added encryption key, run seed again to complete it.',
    dump: 'Added encryption key, run dump again to complete it.',
    init: 'Added encryption key, run init again to complete it.',
    info: 'Added encryption key, run info again to complete it.'
  }

  const dialog = ansi.cross + ' ' + explain[cmd]
  const ask = 'Password'
  const delim = ':'
  const validation = (key) => key.length > 0
  const msg = '\nPlease, enter a valid password.\n'
  const interact = new Interact(dialog, [
    {
      name: 'value',
      default: '',
      prompt: ask,
      delim,
      validation,
      msg
    }
  ], { masked: true })
  const { fields } = await interact.run()
  print(`\n${ansi.key} Hashing password...`)
  await ipc.permit({ key, password: fields.value })
  print('\n' + ansi.tick + ' ' + message[cmd] + '\n')
  await ipc.close()
  process.exit()
}

function permit (ipc, info, cmd) {
  const key = info.key
  if (info.encrypted) {
    return password(ipc, key, cmd)
  } else {
    return trust(ipc, key, cmd)
  }
}

async function confirm (dialog, ask, delim, validation, msg) {
  const interact = new Interact(dialog, [
    {
      name: 'value',
      default: '',
      prompt: ask,
      delim,
      validation,
      msg
    }
  ])
  await interact.run()
}

module.exports = { usage, permit, stdio, ansi, indicator, status, print, outputter, isTTY, confirm, byteSize, byteDiff, Interact }
