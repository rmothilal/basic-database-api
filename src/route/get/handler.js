'use strict'

const userDomain = require('../../domain/user')
const errorHandler = require('../../lib/error')
const Logger = require('@mojaloop/central-services-logger')
const uuidv4 = require('uuid/v4')

const listUsers = async (request, h) => {
  const uuid = uuidv4()
  try {
    Logger.debug(`listUsers:: id=${uuid} - method: '${request.method}', path: '${request.path}'`)
    const users = await userDomain.listUsers()
    Logger.debug(`listUsers:: id=${uuid} - result: ${JSON.stringify(users)}`)
    return h.response(users).code(200)
  } catch (err) {
    const errorResponse = errorHandler.parseErrorToJson(err)
    Logger.info(`listUsers:: id=${uuid} - Error Response: ${JSON.stringify(errorResponse)}`)
    Logger.error(err.stack)
    return h.response(errorResponse).code(500)
  }
}

module.exports = {
  listUsers
}
