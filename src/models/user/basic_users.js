'use strict'

const Db = require('../../lib/db')

const addUser = async (userName) => {
  return await Db.basic_users.insert({userName})
}

const listUsers = async () => {
  return await Db.basic_users.find({}, { order: 'userName asc' })
}

module.exports = {
  addUser,
  listUsers
}
