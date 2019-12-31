'use strict'

// Set options as a parameter, environment variable, or rc file.
const compiler = require('esm')(module/*, options */)
module.exports = compiler('./src/index.js')
