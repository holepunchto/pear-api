'use strict'
const { Readable } = require('streamx')

function parse (template, locals, shave = {}) {
  const args = []
  const strings = []
  let last = 0
  template += ''
  for (const result of template.matchAll(/__([a-zA-Z/\\.:]*?)__/g)) {
    const [match, def] = result
    const [name] = def.split(':').map((s) => s.trim())
    const { index } = result
    const [before = 0, after = 0] = Array.isArray(shave[name]) ? shave[name] : []
    strings.push(template.slice(last, index + before))
    args.push(locals[name] + '')
    last = index + match.length + after
  }
  strings.push(template.slice(last))
  return { strings, args }
}

function stream (template, locals, shave) {
  const { strings, args } = parse(template, locals, shave)
  return new Readable({
    objectMode: true,
    async read (cb) {
      try {
        for (let i = 0; i < strings.length; i++) {
          this.push(strings[i])
          if (i < args.length) for await (const chunk of interlope(await args[i])) this.push(chunk)
        }
        this.push(null)
        cb(null)
      } catch (err) {
        cb(err)
      }
    }
  })
}

function interlope (arg) {
  return new Readable({
    objectMode: true,
    async read (cb) {
      try {
        if (arg === null || typeof arg !== 'object') {
          this.push(arg)
        } else if (Array.isArray(arg)) {
          for (const item of arg) {
            if (item === arg) continue
            for await (const chunk of interlope(item)) this.push(chunk)
          }
        } else if (typeof arg[Symbol.asyncIterator] === 'function') {
          for await (const chunk of arg) this.push(chunk)
        } else {
          this.push(await arg)
        }
        this.push(null)
        cb(null)
      } catch (err) {
        this.destroy(err)
        cb(err)
      }
    }
  })
}

function sync (template, locals, shave) {
  const { strings, args } = parse(template, locals, shave)
  return String.raw({ raw: strings }, ...args)
}

module.exports = { stream, sync }
