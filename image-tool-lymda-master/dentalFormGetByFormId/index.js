const AWS = require('aws-sdk')
const processResponse = require('./process-response.js')
const { GetFormDataByFormId } = require('./dynamodb')
const IS_CORS = true

exports.handler = async event => {
    console.log("event", JSON.stringify(event));
  if (event.httpMethod === 'OPTIONS') {
    return processResponse(IS_CORS);
  }
   const requestedItemId = event.pathParameters.formid;
    if (!requestedItemId) {
        return processResponse(IS_CORS, `Error: You missing the id parameter`, 400);
    }
  try {
    const res = await GetFormDataByFormId(requestedItemId)
    const response = res.Item
    return processResponse(IS_CORS, response);
  } catch (error) {
    console.log(error);
    return processResponse(IS_CORS, error, 500);
  }
};