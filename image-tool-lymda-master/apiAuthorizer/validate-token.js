const jwt = require('jsonwebtoken');
require('dotenv').config();

const validateToken = async (payloadToken) => {
    // verify jwt token
    try {
        const tokenSecret = process.env.ACCESS_TOKEN_SECRET;
        const verifyToken = jwt.verify(payloadToken, tokenSecret);
        
        const policies = { "principalId": "abc123", "policyDocument": { "Version": "2012-10-17", "Statement": [ { "Action": "execute-api:Invoke", "Resource": "arn:aws:execute-api:us-east-2:723461240088:nqnzcj40s8/*/*", "Effect": "Allow" } ] } };

        return Promise.resolve(policies);
    } catch(error) {
        console.log("error in validating token: "+error);
        const policies = { "principalId": "abc123", "policyDocument": { "Version": "2012-10-17", "Statement": [ { "Action": "execute-api:Invoke", "Resource": "arn:aws:execute-api:us-east-2:723461240088:nqnzcj40s8/*/*", "Effect": "Deny" } ] } };
        return Promise.reject(policies);
    }
}

module.exports = { validateToken }
