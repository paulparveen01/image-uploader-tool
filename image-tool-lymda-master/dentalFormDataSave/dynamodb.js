const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-2' })
const documentClient = new AWS.DynamoDB.DocumentClient()
const TABLE_NAME = process.env.TABLE_NAME || 'formdata'

// DynamoDB functions.

const getFormDataByFormId = async (formID) => {
    const key = {};
    key['formId'] = formID;
    const params = {
      TableName: TABLE_NAME,
      Key: key
    }
    console.log(params)
    try {
        const response = await documentClient.get(params).promise()
        if(Object.keys(response).length === 0) {
            return Promise.reject({statusCode: 404, errmsg: "No record found."});
        }
        return Promise.resolve(response)
    } catch (dbError){
        console.error(dbError);
        let errorResponse = `Error: Execution update, caused a Dynamodb error, please look at your logs.`;
        if (dbError.code === 'ValidationException') {
            if (dbError.message.includes('reserved keyword')) errorResponse = `Error: You're using AWS reserved keywords as attributes`;
        }
        return Promise.reject({statusCode: 400, errmsg: errorResponse});
    }
}

const saveFormData = async (formData) => {
      const params = {
      TableName: TABLE_NAME,
      Item: formData
    }
    console.log(params)
    
    try {
      const response = await documentClient.put(params).promise();
      return Promise.resolve(response)
    } catch (dbError) {
        console.error(dbError)  
        let errorResponse = `Error: Execution update, caused a Dynamodb error, please look at your logs.`;
        if (dbError.code === 'ValidationException') {
          if (dbError.message.includes('reserved keyword')) errorResponse = `Error: You're using AWS reserved keywords as attributes`;
        }
        return Promise.reject({statusCode: 400, errmsg: errorResponse});
    }
}

module.exports = { saveFormData, getFormDataByFormId }