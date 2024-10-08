module.exports = (isCors, body, statusCode) => {
    const status = statusCode || (body ? 200 : 204);
    const headers = { 'Content-Type': 'application/json' };
    if (isCors) {
      Object.assign(headers, {
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Max-Age': '86400'
      });
    }
    return body; //return policy
  };