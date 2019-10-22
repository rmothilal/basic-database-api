'use strict'

const userDomain = require('../../domain/user')
const errorHandler = require('../../lib/error')
const Logger = require('@mojaloop/central-services-logger')
const uuidv4 = require('uuid/v4')

const addUser = async (request, h) => {
  const uuid = uuidv4()
  try {
    Logger.debug(`addUser:: id=${uuid} - method: '${request.method}', path: '${request.path}', params: '${JSON.stringify(request.params)}'`)
    const result = await userDomain.addUser(request.params.userName)
    Logger.debug(`addUser:: id=${uuid} - result: ${JSON.stringify(result)}`)
    return h.response().code(201)
  } catch (err) {
    const errorResponse = errorHandler.parseErrorToJson(err)
    Logger.debug(`addUser:: id=${uuid} - Error Response: ${JSON.stringify(errorResponse)}`)
    Logger.error(err.stack)
    return h.response(errorResponse).code(500)
  }
}

module.exports = {
  addUser
}
