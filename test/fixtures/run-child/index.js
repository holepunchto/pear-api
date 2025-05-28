const process = require('process')
const pipe = Pear.pipe
pipe.write(`${process.pid}\n`)
