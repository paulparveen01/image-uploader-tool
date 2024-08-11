const AWS = require('aws-sdk')
const { getFormsData } = require('./dynamodb');
const {cleanupData} = require('./form');
exports.handler = async event => {
  try {
    const res = await cleanupData();
    //const res = getFormsData();
    return Promise.resolve(res);
  } catch (error) {
    console.log(error);
    return Promise.reject(error)
  }
};