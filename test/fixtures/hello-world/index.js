'use strict'

const Helper = require('../../helper')
Helper.rig({ state: { config: { args: Bare.argv.slice(4) } } })

const pipe = Pear.pipe
pipe.on('data', () => {
  try {
    pipe.write('hello world\n')
  } catch (err) {
    console.error(err)
    Pear.exit()
  }
})
