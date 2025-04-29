'use strict'
const { Readable } = require('streamx')
const { test } = require('brittle')
const opwait = require('../opwait')

test('opwait', async function (t) {
  t.plan(4)
  const statuses = [
    { tag: 'begin', data: { n: 3 } },
    { tag: 'middle', data: { n: 2 } },
    { tag: 'final', data: { n: 1 } }
  ]
  const expected = structuredClone(statuses)

  const stream = Readable.from(statuses)
  const final = await opwait(stream, (status) => {
    t.alike(status, expected.shift())
  })
  t.alike(final, { n: 1 })
})

test('opwait rejection', async function (t) {
  t.plan(1)
  const stream = new Readable()
  setImmediate(() => { stream.destroy(new Error('test')) })
  await t.exception(opwait(stream), /test/)
})
