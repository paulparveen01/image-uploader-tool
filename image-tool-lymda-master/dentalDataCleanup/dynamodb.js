'use strict'

const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-2' })
const documentClient = new AWS.DynamoDB.DocumentClient()
const TABLE_NAME = process.env.TABLE_NAME || 'formdata'

// DynamoDB functions.

const scanForms = function(date,callback) {
 
    const docClient = new AWS.DynamoDB.DocumentClient();
 
    const params = {
        TableName:TABLE_NAME,
        FilterExpression: 'attribute_exists(images.original) AND created <= :hkey',
        ExpressionAttributeValues: {
            ':hkey': date
        },
    };
 
    let items = []
     
    const scanExecute = function(callback) {
     
        docClient.scan(params,function(err,result) {
 
            if(err) {
                callback(err);
            } else {
                 
                items = items.concat(result.Items);
 
                if(result.LastEvaluatedKey) {
 
                    params.ExclusiveStartKey = result.LastEvaluatedKey;
                    scanExecute(callback);              
                } else {
                    callback(err,items);
                }   
            }
        });
    }
     
    scanExecute(callback);
};
const getFormsData = async () => {
    var date = new Date();
    date.setDate(date.getDate() - 40);
    const timestamp = Math.floor(date/ 1000)
    console.log("timestamp:", timestamp);

    try {
        return new Promise ((resolve, reject) => {
            scanForms(timestamp, (error, data) => {
                if (error) {
                    return reject(error)
                }
                console.log("data.length: ", data.length);
                console.log("data: ", data);
                return resolve(data)
            })
        })
    } catch (dbError){
        console.error(dbError);
        let errorResponse = `Error: Execution update, caused a Dynamodb error, please look at your logs.`;
        if (dbError.code === 'ValidationException') {
            if (dbError.message.includes('reserved keyword')) errorResponse = `Error: You're using AWS reserved keywords as attributes`;
        }
        return Promise.reject(errorResponse)
    }
}

const updateFormData = async (formDetail) => {
    console.log(formDetail)
    try {
        const images = formDetail.images;
        delete images.original
        const params = {
            TableName: TABLE_NAME,
            Key: {
                "formId": formDetail.formId
            },
            ExpressionAttributeNames: {
                "#imgKey": "images"
            }, 
            ExpressionAttributeValues: {
                ":imgValue": images
            },
            UpdateExpression: 'Set #imgKey = :imgValue',
            ReturnValues:"ALL_NEW"
        };
        const documentClient = new AWS.DynamoDB.DocumentClient();
        const response = await documentClient.update(params).promise();
        return Promise.resolve(response);
    } catch (dbError){
        console.error(dbError)
        let errorResponse = `Error: Execution update, caused a Dynamodb error, please look at your logs.`;
        if (dbError.code === 'ValidationException') {
            if (dbError.message.includes('reserved keyword')) errorResponse = `Error: You're using AWS reserved keywords as attributes`;
        }
        return Promise.reject(errorResponse)
    }
}

module.exports = { getFormsData, updateFormData }