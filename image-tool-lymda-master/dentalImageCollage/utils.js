module.exports.returnResponse = (res, result, statusCode) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(statusCode || 200).json(result);
    return res;
};

module.exports.returnError = (res, result) => {
    res.setHeader('Content-Type', 'application/json');
    let statusCode = 500;
    if (result && result.statusCode) {
        statusCode = result.statusCode;
    }

    if (result instanceof Error) {

        if (result.sqlMessage) {
            result = {
                message: result.sqlMessage,
                stack: result.stack
            }
        } else {
            result = {
                message: result.message,
                stack: result.stack
            }
        }

    }

    return res.status(statusCode).json(result);
};