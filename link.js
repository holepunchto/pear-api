'use strict'
const constants = require('./constants')
const { ERR_INVALID_LINK } = require('./errors')
const PearLink = require('pear-link')
module.exports = new PearLink(constants.ALIASES, ERR_INVALID_LINK)
