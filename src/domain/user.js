'user strict'

const userModel = require('../models/user/basic_users')

const addUser = async (userName) => {
  return userModel.addUser(userName)
}

const listUsers = async () => {
  return userModel.listUsers()
}

module.exports = {
  addUser,
  listUsers
}