'use strict'

const userDomain = require('../../domain/user')

const listUsers = async (request, h) => {
  const users = await userDomain.listUsers()
  return h.response(users).code(201)
}

module.exports = {
  listUsers
}
