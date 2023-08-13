const settings = require('../config/settings')
const axios = require('axios')
const cheerio = require('cheerio')
const { dynamoDB } = require('./factory')
const { randomUUID } = require('crypto')

class Handler {
  static async main(event) {
    console.log('at ', new Date().toISOString(), JSON.stringify(event, null, 2))
    const { data } = await axios.get(settings.commitMessagesUrl)
    const $ = cheerio.load(data)
    const [commitMessage] = $('#content').text().trim().split('\n')
    console.log('Message:', commitMessage)
    const params = {
      TableName: settings.dbTableName,
      Item: {
        commitMessage,
        id: randomUUID(),
        createdAt: new Date().toISOString()
      }
    }
    await dynamoDB.put(params).promise()
    console.log('Process finished ', new Date().toISOString())

    return {
      statusCode: 200
    }
  }
}

module.exports = {
  scheduler: Handler.main
}
