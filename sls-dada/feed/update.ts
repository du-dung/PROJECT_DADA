'use strict'

import { DynamoDB } from 'aws-sdk'

const dynamoDb = new DynamoDB.DocumentClient()

module.exports.update = (event, context, callback) => {
  const data = JSON.parse(event.body)

  const params = {
    TableName: 'feed',
    Key: {
      user: event.pathParameters.user,
      date: event.pathParameters.date
    },
    ExpressionAttributeValues: {
      ':tags': dynamoDb.createSet(data['tags'])
    },
    UpdateExpression: 'SET tags=:tags',
    ReturnValues: 'ALL_NEW'
  }

  if (data['location'] !== undefined) {
    params['ExpressionAttributeNames'] = {
      '#location': 'location'
    }
    params.ExpressionAttributeValues[':location'] = data['location']
    params.UpdateExpression = params.UpdateExpression.concat(', #location=:location')
  }

  if (data['title'] !== undefined) {
    params.ExpressionAttributeValues[':title'] = data['title']
    params.UpdateExpression = params.UpdateExpression.concat(', title=:title')
  }

  if (data['contents'] !== undefined) {
    params.ExpressionAttributeValues[':contents'] = data['contents']
    params.UpdateExpression = params.UpdateExpression.concat(', contents=:contents')
  }

  if (data['S3Object'] !== undefined) {
    params.ExpressionAttributeValues[':S3Object'] = data['S3Object']
    params.UpdateExpression = params.UpdateExpression.concat(', S3Object=:S3Object')
  }

  dynamoDb.update(params, (error, result) => {
    if (error) {
      console.error(error)
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the todo items.'
      })
      return
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Attributes)
    }
    callback(null, response)
  })
}
