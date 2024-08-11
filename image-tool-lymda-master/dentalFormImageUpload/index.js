const processResponse = require('./process-response.js');
const { updateForm } = require('./form');
const IS_CORS = true;

exports.handler = async (event) => {
    
    if (event.httpMethod === 'OPTIONS') {
        return processResponse(IS_CORS);
    }
    const body = JSON.parse(event.body);
    if (!body ) {
        return processResponse(IS_CORS, {statusCode: 400, error: 'payload required'}, 400);
    }
    if (!body.images || body.images.length <=0) {
        return processResponse(IS_CORS, {statusCode: 400, error: 'images required to upload.'}, 400);
    }
    const requestedItemId = event.pathParameters.formid;
    console.log("form id: ", requestedItemId);
    console.log("body.file_name : ", body.file_name);
    try {
        const response = await updateForm(requestedItemId, body );
        console.log("form id: ", requestedItemId, " : ", JSON.stringify(response));
        return processResponse(IS_CORS, response);
    } catch (error) {
        return processResponse(IS_CORS, error, 500);
    }
};