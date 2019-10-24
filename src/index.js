'use strict'

const Hapi = require('@hapi/hapi')
const Migrator = require('./lib/migrator')
const Db = require('./lib/db')
const Config = require('./lib/config')
const Plugins = require('./plugins')
const Logger = require('@mojaloop/central-services-logger')
const uuidv4 = require('uuid/v4')
const mysql = require('./lib/mysql')
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
      Logger.debug(`knex.client.pool.validate - _fatalError = ${JSON.stringify(connection._fatalError)}`)
      return false
    }

    let result
    try {
      result = connection.query('SELECT 1')
      // result = await connection.promise().query('select 1', [], function (err, rows, fields) {
      //   if (err) {
      //     Promise.reject(err)
      //   } else {
      //     Promise.resolve(rows)
      //   }
      // })
      // Logger.silly(`knex.client.pool.validate - select(1) = ${JSON.stringify(result)}`)
      // Logger.debug(`knex.client.pool.validate - select(1) = ${JSON.stringify(result._results)}`)
      Logger.debug(`knex.client.pool.validate - select(1) = ${JSON.stringify(result.rows)}`)
      // Logger.debug(`knex.client.pool.validate - select(1) = ${JSON.stringify(result)}`)
      return true
    } catch (err) {
      Logger.error(`knex.client.pool.validate - caught Error - ${err}`)
      // await Db.connect(Config.DATABASE)
      return false
    } finally {
      connection.release()
    }
  }

  // knex.client.pool.validate = validatePoolResourceDefault
  // knex.client.pool.validate = validatePoolResource
  // knex.client.pool.validate = validatePoolResourceMysqlDialect
  // knex.client.pool.validate = validatePoolResourceMysql2Dialect
  // knex.client.pool.validate = validatePoolResourceMysqlDialectTest
  // knex.client.pool.validate = validatePoolResourceMysql2DialectTest

  const pool = knex.client.pool

  const printKnexPoolInfo = (id, eventType) => {
    // returns the number of non-free resources
    Logger.debug(`${id} - ${eventType} - knex.client.pool.numUsed()=${pool.numUsed()}`)

    // returns the number of free resources
    Logger.debug(`${id} - ${eventType} - knex.client.pool.numFree()=${pool.numFree()}`)

    // how many acquires are waiting for a resource to be released
    Logger.debug(`${id} - ${eventType} - knex.client.pool.numPendingAcquires()=${pool.numPendingAcquires()}`)

    // how many asynchronous create calls are running
    Logger.debug(`${id} - ${eventType} - knex.client.pool.numPendingCreates()=${pool.numPendingCreates()}`)
  }

  printKnexPoolInfo(uuidv4(), 'startup')

  // The following examples add synchronous event handlers for example to
  // allow externally collect diagnostic data of pool behaviour.
  // If any of these hooks fail, all errors are catched and warnings are logged.

  // // resource is acquired from pool
  // pool.on('acquireRequest', eventId => {
  //   const id = uuidv4()
  //   const eventType = 'acquireRequest'
  //   printKnexPoolInfo(id, eventType)
  //   Logger.debug(`${id} - ${eventType} - knex.client.pool.on.acquireSuccess - eventId:${eventId}`)
  // })
  // pool.on('acquireSuccess', (eventId, resource) => {
  //   const id = uuidv4()
  //   const eventType = 'acquireSuccess'
  //   printKnexPoolInfo(id, eventType)
  //   Logger.debug(`${id} - ${eventType} - knex.client.pool.on.acquireSuccess - eventId:${eventId}, resource.state:${resource.state}`)
  // })
  // pool.on('acquireFail', (eventId, err) => {
  //   const id = uuidv4()
  //   const eventType = 'acquireFail'
  //   printKnexPoolInfo(id, eventType)
  //   Logger.debug(`${id} - ${eventType} - knex.client.pool.on.acquireFail - eventId:${eventId}, err:${err}`)
  // })
  //
  // // resource returned to pool
  // pool.on('release', resource => {
  //   const id = uuidv4()
  //   const eventType = 'release'
  //   printKnexPoolInfo(id, eventType)
  //   Logger.debug(`${id} - ${eventType} - knex.client.pool.on.release - resource.state:${resource.state}`)
  // })
  //
  // // resource was created and added to the pool
  // pool.on('createRequest', eventId => {
  //   const id = uuidv4()
  //   const eventType = 'createRequest'
  //   printKnexPoolInfo(id, eventType)
  //   Logger.debug(`${id} - ${eventType} - knex.client.pool.on.createRequest - eventId:${eventId}`)
  // })
  // pool.on('createSuccess', (eventId, resource) => {
  //   const id = uuidv4()
  //   const eventType = 'createSuccess'
  //   printKnexPoolInfo(id, eventType)
  //   Logger.debug(`${id} - ${eventType} - knex.client.pool.on.createSuccess - eventId:${eventId}, resource.state:${resource.state}`)
  // })
  // pool.on('createFail', (eventId, err) => {
  //   const id = uuidv4()
  //   const eventType = 'createFail'
  //   printKnexPoolInfo(id, eventType)
  //   Logger.debug(`${id} - ${eventType} - knex.client.pool.on.createFail - eventId:${eventId}, err:${err}`)
  // })
  //
  // // resource is destroyed and evicted from pool
  // // resource may or may not be invalid when destroySuccess / destroyFail is called
  // pool.on('destroyRequest', (eventId, resource) => {
  //   const id = uuidv4()
  //   const eventType = 'destroyRequest'
  //   printKnexPoolInfo(id, eventType)
  //   Logger.debug(`${id} - ${eventType} - knex.client.pool.on.destroyRequest - eventId:${eventId}, resource.state:${resource.state}`)
  // })
  // pool.on('destroySuccess', (eventId, resource) => {
  //   const id = uuidv4()
  //   const eventType = 'destroySuccess'
  //   printKnexPoolInfo(id, eventType)
  //   Logger.debug(`${id} - ${eventType} - knex.client.pool.on.destroySuccess - eventId:${eventId}, resource.state:${resource.state}`)
  // })
  // pool.on('destroyFail', (eventId, resource, err) => {
  //   const id = uuidv4()
  //   const eventType = 'destroyFail'
  //   printKnexPoolInfo(id, eventType)
  //   Logger.debug(`${id} - ${eventType} - knex.client.pool.on.destroyFail - eventId:${eventId}, resource.state:${resource.state}, err:${err}`)
  // })
  //
  // // when internal reaping event clock is activated / deactivated
  // pool.on('startReaping', () => {
  //   const id = uuidv4()
  //   const eventType = 'startReaping'
  //   printKnexPoolInfo(id, eventType)
  //   Logger.debug(`${id} - ${eventType} - knex.client.pool.on.startReaping - ...`)
  // })
  // pool.on('stopReaping', () => {
  //   const id = uuidv4()
  //   const eventType = 'stopReaping'
  //   printKnexPoolInfo(id, eventType)
  //   Logger.debug(`${id} - ${eventType} - knex.client.pool.on.stopReaping - ...`)
  // })
  //
  // // pool is destroyed (after poolDestroySuccess all event handlers are also cleared)
  // pool.on('poolDestroyRequest', eventId => {
  //   const id = uuidv4()
  //   const eventType = 'poolDestroyRequest'
  //   printKnexPoolInfo(id, eventType)
  //   Logger.debug(`${id} - ${eventType} - knex.client.pool.on.poolDestroyRequest - eventId:${eventId}`)
  // })
  // pool.on('poolDestroySuccess', eventId => {
  //   const id = uuidv4()
  //   const eventType = 'poolDestroySuccess'
  //   printKnexPoolInfo(id, eventType)
  //   Logger.debug(`${id} - ${eventType} - knex.client.pool.on.poolDestroySuccess - eventId:${eventId}`)
  // })
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
  if (Config.DATABASE.client === 'mysql-native') {
    await mysql.connect()
  } else {
    await connectDatabase()
  }
  return createServer(port, modules)
}

module.exports = {
  initialize,
  createServer
}
