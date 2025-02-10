'use strict'
/* global Pear */

import test from 'brittle'
import path from 'path'

const testDir = Pear.config.dir

test('worker pipe', async function ({ is, plan }) {
  plan(1)
  const dir = path.join(testDir, 'fixtures', 'worker')
  const pipe = Pear.run(dir)
  pipe.on('error', (err) => {
    if (err.code === 'ENOTCONN') return
    throw err
  })

  const messages = []
  const response = new Promise((resolve) => {
    pipe.on('data', (data) => {
      messages.push(data.toString())
      if (messages.length === 4) resolve(messages.join(''))
    })
  })

  pipe.write('ping')

  const workerResponse = await response
  is(workerResponse, '0123', 'worker pipe can send and receive data')

  pipe.write('exit')
})
