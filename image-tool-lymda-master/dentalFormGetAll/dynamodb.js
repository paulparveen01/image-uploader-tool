'use strict'

const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-2' })
const documentClient = new AWS.DynamoDB.DocumentClient()
const TABLE_NAME = process.env.TABLE_NAME || 'formdata'

// DynamoDB functions.

const GetAllFormData = async () => {
   const params = {
      TableName: TABLE_NAME
    }
    console.log(params)
    try {
         const response = await documentClient.scan(params).promise()
         return Promise.resolve(response)
    } catch (dbError){
        console.error(dbError)
        let errorResponse = `Error: Execution update, caused a Dynamodb error, please look at your logs.`;
        if (dbError.code === 'ValidationException') {
            if (dbError.message.includes('reserved keyword')) errorResponse = `Error: You're using AWS reserved keywords as attributes`;
        }
        return Promise.reject(errorResponse)
    }
}

module.exports = { GetAllFormData }