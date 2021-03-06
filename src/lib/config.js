const RC = require('rc')('BDA', require('../../config/default.json'))

module.exports = {
  HOSTNAME: RC.HOSTNAME.replace(/\/$/, ''),
  PORT: RC.PORT,
  RUN_MIGRATIONS: !RC.MIGRATIONS.DISABLED,
  RUN_DATA_MIGRATIONS: RC.MIGRATIONS.RUN_DATA_MIGRATIONS,
  DATABASE: {
    client: RC.DATABASE.DIALECT,
    connection: {
      host: RC.DATABASE.HOST.replace(/\/$/, ''),
      port: RC.DATABASE.PORT,
      user: RC.DATABASE.USER,
      password: RC.DATABASE.PASSWORD,
      database: RC.DATABASE.SCHEMA
    },
    pool: {
      // minimum size
      min: RC.DATABASE.POOL_MIN_SIZE,
      // maximum size
      max: RC.DATABASE.POOL_MAX_SIZE,
      // acquire promises are rejected after this many milliseconds
      // if a resource cannot be acquired
      acquireTimeoutMillis: RC.DATABASE.ACQUIRE_TIMEOUT_MILLIS,
      // create operations are cancelled after this many milliseconds
      // if a resource cannot be acquired
      createTimeoutMillis: RC.DATABASE.CREATE_TIMEOUT_MILLIS,
      // destroy operations are awaited for at most this many milliseconds
      // new resources will be created after this timeout
      destroyTimeoutMillis: RC.DATABASE.DESTROY_TIMEOUT_MILLIS,
      // free resouces are destroyed after this many milliseconds
      idleTimeoutMillis: RC.DATABASE.IDLE_TIMEOUT_MILLIS,
      // how often to check for idle resources to destroy
      reapIntervalMillis: RC.DATABASE.REAP_INTERVAL_MILLIS,
      // long long to idle after failed create before trying again
      createRetryIntervalMillis: RC.DATABASE.CREATE_RETRY_INTERVAL_MILLIS
      // ping: function (conn, cb) { conn.query('SELECT 1', cb) }
    },
    debug: RC.DATABASE.DEBUG
  }
}
