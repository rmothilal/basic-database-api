'use strict'

const Config = require('../lib/config')
const Routes = require('./routes')
const Setup = require('../index')

module.exports = Setup.initialize({
  port: Config.PORT,
  modules: [Routes],
  runMigrations: Config.RUN_MIGRATIONS
})
