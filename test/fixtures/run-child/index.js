const process = require('process')
const pipe = require('pear-pipe')()
pipe.write(`${process.pid}\n`)
