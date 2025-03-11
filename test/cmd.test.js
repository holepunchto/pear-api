'use strict'

const { test } = require('brittle')

test('cmd', async function (t) {
  t.plan(3)

  const cmd = require('../cmd')
  const res = cmd(['--log', 'run', 'pear://runtime'])

  t.ok(res.flags.log === true)
  t.ok(res.args.cmd === 'run')
  t.ok(res.rest[0] === 'pear://runtime')
})
