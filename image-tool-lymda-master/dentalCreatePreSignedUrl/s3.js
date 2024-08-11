const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-2' });
const s3 = new AWS.S3();
let bucketName = process.env.BUCKET_NAME || 'dental-images';
const cloudfrontURL = process.env.COUDFRONT_URL || 'https://d1czbxowbjd7i2.cloudfront.net';

const getPreSignedUrlFromS3 = async (inputParams) => {
     console.log("imageKeyPath: ", inputParams.imageKeyPath);
     console.log("contentType: ", inputParams.contentType);
     try {
        const params = {
            Bucket: bucketName,
            Key: inputParams.imageKeyPath,
            ContentType: inputParams.contentType
        };
        console.log("parms: ", params);
        const signedUrl = await s3.getSignedUrlPromise('putObject', params);
        return Promise.resolve(signedUrl);
     } catch (error) {
         console.log("error: ", error);
        return Promise.reject(error);
     }
};

module.exports = { getPreSignedUrlFromS3 };

