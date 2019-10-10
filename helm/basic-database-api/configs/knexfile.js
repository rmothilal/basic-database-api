'use strict'

const migrationsDirectory = '/opt/basic-database-api/migrations'
const seedsDirectory = '/opt/basic-database-api/seeds'

const Config = require('/opt/basic-database-api/src/lib/config')

module.exports = {
    client: 'mysql',
    connection: Config.DATABASE.connection,
    pool: Config.DATABASE.pool,
    migrations: {
        directory: migrationsDirectory,
        tableName: 'migration',
        stub: `${migrationsDirectory}/migration.template`
    },
    seeds: {
        directory: seedsDirectory,
        loadExtensions: ['.js']
    }
}
