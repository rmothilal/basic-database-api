'use strict'

const Hapi = require('@hapi/hapi')
const Migrator = require('./lib/migrator')
const Db = require('./lib/db')
const Config = require('./lib/config')
const Plugins = require('./plugins')
const Logger = require('@mojaloop/central-services-logger')
// const Moment = require('moment')

const migrate = async (runMigrations) => {
  return runMigrations ? Migrator.migrate() : true
}

const connectDatabase = async () => {
  await Db.connect(Config.DATABASE)
  const knex = Db.getKnex()

  const validatePoolResourceDefault = async (resource) => {
    return true
  }

  const validatePoolResource = async (connection) => {
    // eslint-disable-next-line
    if(connection.state === "disconnected") {
      Logger.warn(`knex.client.pool.validate - state =  ${connection.state}`)
      return false
    }

    if (connection._fatalError) {
      Logger.error(`knex.client.pool.validate - fatalError = ${connection._fatalError}`)
      return false
    }

    if (connection.__knex__disposed) {
      Logger.warn(`knex.client.pool.validate - disposed =  ${connection.__knex__disposed}`)
      return false
    }

    let result = null
    try {
      result = await knex.select(1)
      Logger.silly(`knex.client.pool.validate - select(1) = ${JSON.stringify(result)}`)
      return true
    } catch (err) {
      Logger.error(`knex.client.pool.validate - caught Error - ${err}`)
      // await Db.connect(Config.DATABASE)
      return false
    }
  }

  const validatePoolResourceMysqlDialect = (connection) => {
    if (
      connection.state === 'connected' ||
      connection.state === 'authenticated'
    ) {
      return true
    }
    return false
  }

  const validatePoolResourceMysql2Dialect = (connection) => {
    if (connection._fatalError) {
      return false
    }
    return true
  }

  const validatePoolResourceMysqlDialectTest = async (connection) => {
    if (
      connection.state === 'connected' ||
      connection.state === 'authenticated'
    ) {
      let result = null
      try {
        // result = await connection.query('SELECT 1')
        result = await connection.query('select 1', [], function (err, rows, fields) {
          if (err) {
            Promise.reject(err)
          } else {
            Promise.resolve(rows)
          }
        })
        // Logger.silly(`knex.client.pool.validate - select(1) = ${JSON.stringify(result)}`)
        Logger.silly(`knex.client.pool.validate - select(1) = ${JSON.stringify(result._results)}`)
        return true
      } catch (err) {
        Logger.error(`knex.client.pool.validate - caught Error - ${err}`)
        // await Db.connect(Config.DATABASE)
        return false
      }
    }
    return false
  }

  const validatePoolResourceMysql2DialectTest = async (connection) => {
    if (connection._fatalError) {
      return false
    }

    let result
    try {
      // result = await connection.query('SELECT 1')
      result = await connection.promise().query('select 1', [], function (err, rows, fields) {
        if (err) {
          Promise.reject(err)
        } else {
          Promise.resolve(rows)
        }
      })
      // Logger.silly(`knex.client.pool.validate - select(1) = ${JSON.stringify(result)}`)
      Logger.silly(`knex.client.pool.validate - select(1) = ${JSON.stringify(result._results)}`)
      return true
    } catch (err) {
      Logger.error(`knex.client.pool.validate - caught Error - ${err}`)
      // await Db.connect(Config.DATABASE)
      return false
    }
  }

  // knex.client.pool.validate = validatePoolResourceDefault
  // knex.client.pool.validate = validatePoolResource
  // knex.client.pool.validate = validatePoolResourceMysqlDialect
  // knex.client.pool.validate = validatePoolResourceMysql2Dialect
  knex.client.pool.validate = validatePoolResourceMysqlDialectTest
  // knex.client.pool.validate = validatePoolResourceMysql2DialectTest
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
