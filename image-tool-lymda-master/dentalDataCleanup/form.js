const AWS = require('aws-sdk')
const { getFormsData, updateFormData } = require('./dynamodb');
const { deleteObjectsFromBucket } = require('./s3');
const cloudfrontURL = process.env.CLOUDFRONT_URL || 'https://d1czbxowbjd7i2.cloudfront.net';

const getS3ObjectKeys = (originalImagesUrl) => {
    return originalImagesUrl.reduce((prev, cur) => {
        const objectKey = cur.replace(cloudfrontURL+"/", "")
        prev.push({Key: objectKey});
        return prev;
    }, [])
}

const removeFormData = async (formDetail) => {
    try {
        const objectKeys = getS3ObjectKeys(formDetail.images.original);
        console.log("objectKeys: ", objectKeys);
        const deleteRes = await deleteObjectsFromBucket(objectKeys);
        console.log("deleteRes: ", deleteRes);
        const updateRes = await updateFormData(formDetail);
        console.log("updateRes: ", updateRes);
        return Promise.resolve('ok');
    } catch (error) {
        return Promise.reject(error);
    }
}

const cleanupData = async () => {
    const items = await getFormsData();
    const promise = items.reduce((prev, cur) => {
        console.log("prev, cur", cur);
        prev.push(removeFormData(cur))
        return prev;
    }, []);
    const response = await Promise.all(promise);
    return Promise.resolve(response)
}

module.exports = { cleanupData };