const mysql = require('promise-mysql')
const config = require('../lib/config')
const Logger = require('@mojaloop/central-services-logger')

let pool

const connect = async () => {
  try {
    pool = await mysql.createPool({
      connectionLimit: config.DATABASE.pool.max,
      host: config.DATABASE.connection.host,
      port: config.DATABASE.connection.port,
      user: config.DATABASE.connection.user,
      password: config.DATABASE.connection.password,
      database: config.DATABASE.connection.database
    })
  } catch (err) {
    Logger.error(err)
    throw err
  }
}

const getConnection = async () => {
  return pool.getConnection()
}

module.exports = {
  pool,
  connect,
  getConnection
}
