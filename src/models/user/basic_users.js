'use strict'

const Logger = require('@mojaloop/central-services-logger')
const Db = require('../../lib/db')

const addUser = async (userName) => {
  return Db.basic_users.insert({ userName })
}

const listUsers = async () => {
  return Db.basic_users.find({}, { order: 'userName asc' })
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
} else {
  module.exports = {
    addUser,
    listUsers
  }
}
