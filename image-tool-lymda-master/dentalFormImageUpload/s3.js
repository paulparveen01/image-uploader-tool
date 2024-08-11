const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-2' });
const s3 = new AWS.S3();
let bucketName = process.env.BUCKET_NAME || 'dental-images';
const cloudfrontURL = process.env.COUDFRONT_URL || 'https://d1czbxowbjd7i2.cloudfront.net';
const randomString = () => {
    return (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
};

const uploadImageToS3 = async (...inputParams) => {
    const [keyPath, bufferData, bucket] = inputParams;
    bucketName = bucket ? bucket : bucketName;
    const base64Data = new Buffer.from(bufferData.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const type = bufferData.split(';')[0].split('/')[1];
    console.info("base64Data: ", base64Data);
    try {
       const paramS3 = {
            Bucket: bucketName,
            Key: keyPath + `${randomString()}.${type}`,
            Body: base64Data,
            ContentType: `image/${type}`
        };
        
        const data = await s3.upload(paramS3).promise();
        const url = `${cloudfrontURL}/${data.Key}`;
        return Promise.resolve(url);
    } catch (error) {
        console.error("Error s3 get image details: ", error);
        return Promise.reject(error);
    }
};

const uploadImagesToS3 = async (...inputParams) => {
     const [imageKeyPath, buffersData, bucket] = inputParams;
     try {
        bucketName = bucket ? bucket : bucketName;
        const promises = buffersData.reduce((prev, cur, index) => {
            const fileIndex = parseInt(index) + 1;
            const keyPath = imageKeyPath + '/orig' + fileIndex + '_'; 
            prev.push(uploadImageToS3(keyPath, cur));
            return prev;
        },[]);
        const response = await Promise.all(promises);
        return Promise.resolve(response);
     } catch (error) {
        return Promise.reject(error);
     }
};

module.exports = { uploadImageToS3, uploadImagesToS3 };

