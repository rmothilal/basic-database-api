'use strict'

const Logger = require('@mojaloop/central-services-logger')
const Db = require('../../lib/db')
const Config = require('../../lib/config')

const addUser = async (userName) => {
  return Db.basic_users.insert({ userName })
}

const listUsers = async () => {
  return Db.basic_users.find({}, { order: 'userName asc' })
}

var promiseRetry = require('promise-retry')

const addUserRetry = async (userName) => {
  Logger.debug(`basic_users::addUserRetry - userName: ${userName}`)
  let result
  try {
    result = await promiseRetry(config.DATABASE.retry, async (retry, number) => {
      Logger.debug(`basic_users::addUserRetry - attempt number: ${number}`)

      try {
        return Db.basic_users.insert({ userName })
      } catch (err) {
        Logger.error(`basic_users::addUserRetry::promiseRetry - err.code: ${err.code}`)
        if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNREFUSED' || err.code === 'ER_SERVER_SHUTDOWN') {
          retry(err)
        }
        throw err
      }
    })
  } catch (err) {
    Logger.error(err)
    throw err
  }
  return result
}

const listUsersRetry = async () => {
  Logger.debug(`basic_users::listUsersRetry`)
  let result
  try {
    result = await promiseRetry(config.DATABASE.retry, async (retry, number) => {
      Logger.debug(`basic_users::listUsersRetry - attempt number: ${number}`)

      try {
        return await Db.basic_users.find({}, { order: 'userName asc' })
      } catch (err) {
        Logger.error(`basic_users::listUsersRetry::promiseRetry - err.code: ${err.code}`)
        if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNREFUSED' || err.code === 'ER_SERVER_SHUTDOWN') {
          retry(err)
        }
        throw err
      }
    })
  } catch (err) {
    Logger.error(err)
    throw err
  }
  return result
}

const MysqlPool = require('../../lib/mysql')

const addUserNative = async (userName) => {
  let connection
  try {
    connection = await MysqlPool.getConnection()
    const result = connection.query(`INSERT INTO user_database.basic_users (userName) VALUES ('${userName}');`)
    return result
  } catch (err) {
    Logger.error(err)
    throw err
  } finally {
    if (connection) {
      await connection.release()
    }
  }
}

const listUsersNative = async () => {
  let connection
  try {
    connection = await MysqlPool.getConnection()
    const result = connection.query('select * from basic_users order by userName asc')
    return result
  } catch (err) {
    Logger.error(err)
    throw err
  } finally {
    if (connection) {
      await connection.release()
    }
  }
}

const config = require('../../lib/config')

if (config.DATABASE.client === 'mysql-native') {
  module.exports = {
    addUser: addUserNative,
    listUsers: listUsersNative
  }
} else if (config.DATABASE.retry.enabled) {
  module.exports = {
    addUser: addUserRetry,
    listUsers: listUsersRetry
  }
} else {
  module.exports = {
    addUser,
    listUsers
  }
}
