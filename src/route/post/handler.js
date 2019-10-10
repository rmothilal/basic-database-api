'use strict'

const userDomain = require('../../domain/user')

const addUser = async (request, h) => {
  await userDomain.addUser(request.params.userName)
  return h.response().code(201)
}

module.exports = {
  addUser
}
