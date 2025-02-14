'use strict'
const cmd = require('./cmd')
const { isBare } = require('which-runtime')
const hrtime = isBare ? require('bare-hrtime') : process.hrtime

const pear = global.Pear?.config.cmdArgs ? cmd(global.Pear.config.cmdArgs) : cmd(global.Bare.argv.slice(1))
const run = global.Pear?.config

class Logger {
  static settings = {
    log: run?.flags?.log ?? pear?.flags.log,
    level: run?.flags?.logLevel ?? pear?.flags.logLevel,
    labels: run?.flags?.logLabels ?? pear?.flags.logLabels,
    fields: run?.flags?.logFields ?? pear?.flags.logFields ?? '',
    stacks: run?.flags?.logStacks ?? pear?.flags.logStacks ?? false
  }

  constructor ({ labels, fields, stacks, level, pretty } = {}) {
    level = level ?? this.constructor.defaults
    labels = labels ?? this.constructor.defaults
    fields = fields ?? this.constructor.defaults ?? ''
    stacks = stacks ?? this.constructor.defaults ?? false
    fields = this._parseFields(fields)
    this._labels = new Set(this._parseLabels(labels))
    this._show = fields.show
    this._stacks = stacks
    this._times = {}
    this.stack = ''
    this.LEVEL = this._parseLevel(level)
    if (pretty) {
      if (fields.seen.has('level') === false) this._show.level = false
      if (fields.seen.has('label') === false) this._show.label = this._labels.size > 2
    }
  }

  get OFF () { return this.LEVEL === 0 }
  get ERR () { return this.LEVEL === 1 }
  get INF () { return this.LEVEL === 2 }
  get TRC () { return this.LEVEL === 3 }

  _args (level, label, ...args) {
    const now = hrtime.bigint()
    const ms = Number(now) / 1e6
    const delta = this._times[label] ? ms - Number(this._times[label]) / 1e6 : 0
    this._times[label] = now
    const datetime = (this._show.date || this._show.time) ? new Date().toISOString().split('T') : []
    const date = this._show.date ? datetime[0] : ''
    const time = this._show.time ? datetime[1].slice(0, -1) : ''
    label = this._show.label ? '[ ' + label.slice(0, 14) + ' ]' : ''
    level = this._show.level ? level : ''
    const prefix = [level, date, time, label].filter(Boolean)
    return [...prefix, ...args, this._show.delta ? '[+' + (Math.round(delta * Math.pow(10, 4)) / Math.pow(10, 4)) + 'ms]' : '']
  }

  error (label, ...args) {
    if (this.LEVEL < 1) return
    if (Array.isArray(label)) {
      for (const lbl of label) this.error(lbl, ...args)
      return
    }
    if (!this._labels.has(label)) return
    if (this._stacks) Error.captureStackTrace(this, this.error)
    args = this._args('ERR', label, ...args)
    if (this._stacks) {
      console.error(...args, this.stack)
      this.stack = ''
    } else {
      console.error(...args)
    }
  }

  info (label, ...args) {
    if (this.LEVEL < 2) return
    if (Array.isArray(label)) {
      for (const lbl of label) this.info(lbl, ...args)
      return
    }
    if (!this._labels.has(label)) return
    if (this._stacks) Error.captureStackTrace(this, this.info)
    args = this._args('INF', label, ...args)
    if (this._stacks) {
      console.log(...args, this.stack)
      this.stack = ''
    } else {
      console.log(...args)
    }
  }

  trace (label, ...args) {
    if (this.LEVEL < 3) return
    if (Array.isArray(label)) {
      for (const lbl of label) this.trace(lbl, ...args)
      return
    }
    if (!this._labels.has(label)) return
    if (this._stacks) Error.captureStackTrace(this, this.trace)
    args = this._args('TRC', label, ...args)
    if (this._stacks) {
      console.error(...args, this.stack)
      this.stack = ''
    } else {
      console.error(...args)
    }
  }

  _parseLevel (level) {
    if (typeof level === 'number') return level
    if (typeof level === 'string') level = level.toUpperCase()
    if (level === 'OFF' || level === '0') return 0
    if (level === 'ERR' || level === 'ERROR' || level === '1') return 1
    if (level === 'INF' || level === 'INFO' || level === '2') return 2
    if (level === 'TRC' || level === 'TRACE' || level === 'TRA' || level === '3') return 3
    return 2
  }

  _parseFields (fields) {
    const show = {
      date: false,
      time: false,
      level: true,
      label: true,
      delta: true
    }
    const seen = new Set()
    for (let field of fields.split(',')) {
      if (seen.has(field)) continue
      field = field.trim()
      if (field.startsWith('h:')) {
        field = field.slice(2)
        seen.add(field)
        show[field] = false
        continue
      }
      seen.add(field)
      show[field] = true
    }
    return { seen, show }
  }

  _parseLabels (labels) {
    if (typeof labels !== 'string') return labels
    return labels.split(',')
  }
}

module.exports = Logger
