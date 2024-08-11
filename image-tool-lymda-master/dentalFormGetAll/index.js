const AWS = require('aws-sdk')
const processResponse = require('./process-response.js')
const { GetAllFormData } = require('./dynamodb')
const IS_CORS = true

exports.handler = async event => {
  if (event.httpMethod === 'OPTIONS') {
    return processResponse(IS_CORS);
  }
  
  const sortBy = event.queryStringParameters && event.queryStringParameters.sortby ? event.queryStringParameters.sortby : 'desc';
  try {
    const res = await GetAllFormData();
    if(sortBy === 'asc') {
       res.Items.sort(function(a, b){return a.created - b.created});
    } else {
       res.Items.sort(function(a, b){return b.created - a.created});
    }
  
    const response = {
        forms: res.Items,
        total_count: res.Count
    }
    return processResponse(IS_CORS, response);
  } catch (error) {
    console.log(error);
    return processResponse(IS_CORS, error, 500);
  }
};