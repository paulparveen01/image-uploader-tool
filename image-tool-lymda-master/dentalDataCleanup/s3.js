const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-2' });
const s3 = new AWS.S3();
let bucketName = process.env.BUCKET_NAME || 'dental-images';
const cloudfrontURL = process.env.COUDFRONT_URL || 'https://d1czbxowbjd7i2.cloudfront.net';

const deleteObjectsFromBucket = async (keyObjects) => {
    try {
        const paramS3 = {
            Bucket: bucketName, 
            Delete: { // required
                Objects: keyObjects,
            },
        };
        const data = await s3.deleteObjects(paramS3).promise();
        return Promise.resolve(data);
    } catch(error) {
         return Promise.reject(error);
    }
}

module.exports = { deleteObjectsFromBucket };

