const processResponse = require('./process-response.js');
const { getPreSignedUrlFromS3 } = require('./s3');
const IS_CORS = true;

exports.handler = async event => {
    if (event.httpMethod === 'OPTIONS') {
        return processResponse(IS_CORS);
    }
    if (!event.body) {
        return processResponse(IS_CORS, {statusCode: 400, error: 'payload required'}, 400);
    }
    const item = JSON.parse(event.body);
    if (!item.imageKeyPath) {
        return processResponse(IS_CORS, {statusCode: 400, error: 'Image Key Path required.'}, 400);
    }
    if (!item.contentType) {
        return processResponse(IS_CORS, {statusCode: 400, error: 'Content Type required'}, 400);
    }
    console.log("item: ", item);
    
    try {
        const url = await getPreSignedUrlFromS3(item);
        const response = {signedUrl: url};
        return processResponse(IS_CORS, response, 200);
    } catch (error) {
        return processResponse(IS_CORS, error, 500);
    }
};