const mysql = require('promise-mysql')
const config = require('../lib/config')
const Logger = require('@mojaloop/central-services-logger')

let pool

const connect = async () => {
  try {
    // reference: https://github.com/mysqljs/mysql#pooling-connections
    pool = await mysql.createPool({
      connectionLimit: config.DATABASE.pool.max, // The maximum number of connections to create at once. (Default: 10)
      acquireTimeout: config.DATABASE.pool.ACQUIRE_TIMEOUT_MILLIS, // The milliseconds before a timeout occurs during the connection acquisition. This is slightly different from connectTimeout, because acquiring a pool connection does not always involve making a connection. If a connection request is queued, the time the request spends in the queue does not count towards this timeout. (Default: 10000)
      waitForConnections: true, // Determines the pool's action when no connections are available and the limit has been reached. If true, the pool will queue the connection request and call it when one becomes available. If false, the pool will immediately call back with an error. (Default: true)
      queueLimit: 0, // The maximum number of connection requests the pool will queue before returning an error from getConnection. If set to 0, there is no limit to the number of queued connection requests. (Default: 0)
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
