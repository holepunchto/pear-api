'use strict'
const { command, arg, rest } = require('paparam')
const pear = require('./cmd-def/pear')
module.exports = (argv) => command('pear', ...pear, arg('<cmd>'), rest('rest')).parse(argv, { silent: true })
