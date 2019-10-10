'use strict'

const Hapi = require('@hapi/hapi')
const Migrator = require('./lib/migrator')
const Db = require('./lib/db')
const Config = require('./lib/config')
const Plugins = require('./plugins')


const migrate = async (runMigrations) => {
  return runMigrations ? Migrator.migrate() : true
}

const connectDatabase = async () => {
  return Db.connect(Config.DATABASE)
}

const createServer = (port, modules) => {
  return (async () => {
    const server = await new Hapi.Server({
      port
    })
    await Plugins.registerPlugins(server)
    await server.register(modules)
    await server.start()
    return server
  })()
}

const initialize = async function ({ port, modules = [], runMigrations = false}) {
  await migrate(runMigrations)
  await connectDatabase()
  return createServer(port, modules)
}

module.exports = {
  initialize,
  createServer
}
