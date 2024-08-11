const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = async (event) => {
    
    const item = JSON.parse(event.body);
    const sourceTokenSecret = process.env.SOURCE_CHECK_TOKEN_SECRET;
    try {
        // check if request from valid source
        const whiteLists = ['https://d24e4p0y2o78hs.cloudfront.net'];
        const verifyToken = jwt.verify(item.generateString, sourceTokenSecret);
        // console.log("verifyToken==",verifyToken);
        if ( !verifyToken.domain || !whiteLists.includes(verifyToken.domain) ) {
            return Promise.reject("You are not authorized");
        }
        
        // if valid request then generate jwt token
        const tokenSecret = process.env.ACCESS_TOKEN_SECRET;
        const user = {name: "dummydata"}
        
        const accessToken = jwt.sign(user, tokenSecret, {
            expiresIn : "1h"
        });
        
        return Promise.resolve(accessToken);
    } catch (error) {
        console.log("notvalidd", error);
        return Promise.reject("You are not authorized");
    }
}

module.exports = { generateToken }