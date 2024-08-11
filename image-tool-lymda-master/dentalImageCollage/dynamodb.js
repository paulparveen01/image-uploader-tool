'use strict'

const AWS = require('aws-sdk')
// const fs = require('fs')
// const gm = require('gm').subClass({imageMagick: true})
const jo = require('jpeg-autorotate')
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-2' })
const documentClient = new AWS.DynamoDB.DocumentClient()
const TABLE_NAME = process.env.TABLE_NAME || 'formdata'

if (!process.env.NODE_ENV) {
    require('dotenv').config()
    AWS.config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY_ID,
    };
}

const getImageDetailsFromS3 = (bucketName, imageKeyPath) => {
    return new Promise((resolve, reject) => {
        const paramS3 = {
            Bucket: bucketName,
            Key: imageKeyPath
        };
        const s3 = new AWS.S3();
        s3.getObject(paramS3, (error, data) => {
            if (error) {
                console.error("Error s3 get image details: ", error);
                return reject(err)
            }
            return resolve(data);
        });
    })
}
const rotateImage = (bufferData, fileExtension) => {
  try {
    console.log(bufferData)
    console.log(fileExtension)
    return new Promise ((resolve, reject) => {
        // gm("images/orig2_ln063yr0jagjl3gqq2n7k.jpeg")
        // // .crop(1000, 1000, 10, 10, false)
        // .autoOrient()
        // // .resize(400, 400)
        // .write("images/crop10.jpeg",function (err, buffer) {
        //     if (err) {
        //         return reject("buffer error==", err)
        //     }
        //     return resolve(buffer);
        //   })
        jo.rotate(bufferData)
        .then(({buffer, orientation, dimensions, quality}) => {
          console.log(`Orientation was ${orientation}`)
          console.log(`Dimensions after rotation: ${dimensions.width}x${dimensions.height}`)
          console.log(`Quality: ${quality}`)
          // ...Do whatever you need with the resulting buffer...
          return resolve(buffer);
        })
        .catch((error) => {
          return reject(error)
          if (error.code === jo.errors.correct_orientation) {
            console.log('The orientation of this image is already correct!')
          }
        })
    })
  } catch (error) {
    return Promise.reject(error)
  }
}

// DynamoDB functions.

const getFormsWithoutCollage = async () => {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: "attribute_exists(images.original) AND attribute_exists(images.cropped) AND attribute_not_exists(images.collage)"
    }

    console.log(params)
    try {
         const response = await documentClient.scan(params).promise()
         console.log(response);
         return Promise.resolve(response)
    } catch (dbError){
        console.error(dbError);
        let errorResponse = `Error: Execution update, caused a Dynamodb error, please look at your logs.`;
        if (dbError.code === 'ValidationException') {
            if (dbError.message.includes('reserved keyword')) errorResponse = `Error: You're using AWS reserved keywords as attributes`;
        }
        return Promise.reject(errorResponse)
    }
}

const GetFormDataByFormId = async (formID) => {
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
            return Promise.reject({statusCode: 404, errmsg: "No records found."});
         }
         return Promise.resolve(response)
    } catch (dbError){
        let errorResponse = `Error: Execution update, caused a Dynamodb error, please look at your logs.`;
        if (dbError.code === 'ValidationException') {
            if (dbError.message.includes('reserved keyword')) errorResponse = `Error: You're using AWS reserved keywords as attributes`;
        }
        return Promise.reject(errorResponse)
    }
}

const UpdateFormData = async (params) => {
    console.log(params)
    try {
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

module.exports = { GetFormDataByFormId, UpdateFormData, getFormsWithoutCollage }