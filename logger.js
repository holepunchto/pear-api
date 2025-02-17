'use strict'
const { isBare } = require('which-runtime')
const hrtime = isBare ? require('bare-hrtime') : process.hrtime
const pear = require('./cmd')(global.Bare.argv.slice(2))
const switches = {
  log: pear?.flags.log,
  level: pear?.flags.logLevel,
  labels: pear?.flags.logLabels,
  fields: pear?.flags.logFields,
  stacks: pear?.flags.logStacks
}
class Logger {
  static switches = switches
  static OFF = 0
  static ERR = 1
  static INF = 2
  static TRC = 3

  constructor ({ labels, fields, stacks, level, pretty } = {}) {
    this._fields = this._parseFields(fields)
    this._labels = new Set(this._parseLabels(labels).concat(this._parseLabels(this.constructor.switches.labels)))
    this._show = this._fields.show
    this._stacks = stacks ?? this.constructor.switches.stacks
    this._times = {}
    if (pretty) {
      if (this._fields.seen.has('level') === false) this._show.level = false
      if (this._fields.seen.has('label') === false) this._show.label = this._labels.size > 2
    }
    this.stack = ''
    this.LEVEL = this._parseLevel(level ?? this.constructor.switches.level)
  }

  get OFF () { return this.LEVEL === this.constructor.OFF }
  get ERR () { return this.LEVEL >= this.constructor.ERR }
  get INF () { return this.LEVEL >= this.constructor.INF }
  get TRC () { return this.LEVEL >= this.constructor.TRC }

  _args (level, label, ...args) {
    const now = hrtime.bigint()
    const ms = Number(now) / 1e6
    const delta = this._times[label] ? ms - Number(this._times[label]) / 1e6 : 0
    this._times[label] = now
    const datetime = (this._show.date || this._show.time) ? new Date().toISOString().split('T') : []
    const date = this._show.date ? datetime[0] : ''
    const time = this._show.time ? datetime[1].slice(0, -1) : ''
    label = this._show.label ? '[ ' + label.slice(0, 21) + ' ]' : ''
    level = this._show.level ? level : ''
    const prefix = [level, date, time, label].filter(Boolean)
    return [...prefix, ...args, this._show.delta ? '[+' + (Math.round(delta * Math.pow(10, 4)) / Math.pow(10, 4)) + 'ms]' : '']
  }

  error (label, ...args) {
    if (this.LEVEL < this.constructor.ERR) return
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
    if (this.LEVEL < this.constructor.INF) return
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
    if (this.LEVEL < this.constructor.TRC) return
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
    for (let field of fields.split(',').concat(this.constructor.fields.split(','))) {
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
