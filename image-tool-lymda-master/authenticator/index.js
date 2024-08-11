const genToken = require("./generate-token");
const processResponse = require('./process-response.js');
const IS_CORS = true;

exports.handler = async (event) => {
	// console.log(event);
	// if (event.httpMethod === 'OPTIONS') {
	// 	return processResponse(IS_CORS);
	// }
	
    if (!event.body) {
        return processResponse(IS_CORS, {statusCode: 400, error: 'You are not authorized'}, 400);
    }

	try {
		const response = await genToken.generateToken(event)
		return processResponse(IS_CORS, response);
	} catch (error) {
		return processResponse(IS_CORS, error, 500);
	}
}