const dental = require("./dental");

exports.handler = async (event) => {
	try {
		const response = await dental.processImage(event)
		return Promise.resolve(response);
	} catch (error) {
		return Promise.reject(error)
	}
}
