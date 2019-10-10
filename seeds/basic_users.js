'use strict'

const basic_users = [
  {
    userName: 'user1'
  },
  {
    userName: 'user2'
  },
  {
    userName: 'user3'
  },
  {
    userName: 'user4'
  },
  {
    userName: 'user5'
  },
  {
    userName: 'user6'
  },
  {
    userName: 'user7'
  },
  {
    userName: 'user8'
  },
  {
    userName: 'user9'
  },
  {
    userName: 'user10'
  }
]

exports.seed = async function (knex) {
  try {
    return await knex('basic_users').insert(basic_users)
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return -1001
    else {
      console.log(`Uploading users for user table has failed with the following error: ${err}`)
      return -1000
    }
  }
}
