'use strict'

const { test } = require('brittle')
const fs = require('bare-fs')
const path = require('bare-path')

const transform = require('../transform')

const dirname = __dirname

test('transform sync', async function (t) {
  t.plan(1)

  const templateFile = path.join(dirname, 'fixtures', 'transform', 'template.html')
  const finalFile = path.join(dirname, 'fixtures', 'transform', 'final.html')

  const template = await fs.promises.readFile(templateFile, 'utf8')
  const final = await fs.promises.readFile(finalFile, 'utf8')

  const locals = { name: 'world', version: 'v.1.2.3', url: 'https://docs.pears.com/' }
  const res = transform.sync(template, locals)
  t.ok(res === final)
})

test('transform stream', async function (t) {
  t.plan(1)

  const templateFile = path.join(dirname, 'fixtures', 'transform', 'template.html')
  const finalFile = path.join(dirname, 'fixtures', 'transform', 'final.html')

  const template = await fs.promises.readFile(templateFile, 'utf8')
  const final = await fs.promises.readFile(finalFile, 'utf8')

  const locals = { name: 'world', version: 'v.1.2.3', url: 'https://docs.pears.com/' }

  const stream = transform.stream(template, locals)
  t.teardown(() => stream.destroy())

  let res = ''
  stream.on('data', (chunk) => {
    res += chunk
  })
  await new Promise((resolve) => stream.on('end', resolve))

  t.ok(res === final)
})
