const checkToken = require("./validate-token");
const processResponse = require('./process-response.js');
const jwt = require('jsonwebtoken');
const IS_CORS = true;

exports.handler = async (event) => {
	// if (event.httpMethod === 'OPTIONS') {
	// 	return processResponse(IS_CORS);
	// }

	try {
		const payloadToken = event.authorizationToken;
		const response = await checkToken.validateToken(payloadToken)
		return processResponse(IS_CORS, response);
	} catch (error) {
		return processResponse(IS_CORS, error, 500);
	}
}
