'use strict'

exports.up = async (knex, Promise) => {
  return await knex.schema.hasTable('basic_users').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('basic_users', (t) => {
        t.string('userName', 128).primary().notNullable()
      })
    }
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('basic_users')
}
