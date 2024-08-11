const { getFormDataByFormId, updateFormData } = require('./dynamodb');
const { uploadImageToS3 } = require('./s3');
const TABLE_NAME = process.env.TABLE_NAME || 'formdata'
const updateForm = async (formid, data) => {
    try {
        const originalImages = data.images.slice();
        const croppedImages = data.images.reduce((prev, cur) => {
            const url = cur.replace("/original", "/cropped").replace("/orig", "/crop");
            prev.push(url);
            return prev;
        }, [])
        // const result = await getFormDataByFormId(formid);
        const images = {
            original: originalImages,
            cropped: croppedImages
        };
        console.log("images: ", images);
        const params = {
            TableName: TABLE_NAME,
            Key: {
                "formId": formid
            },
            ExpressionAttributeNames: {
                "#imgKey": "images"
            }, 
            ExpressionAttributeValues: {
                ":imgValue": images
            },
            UpdateExpression: 'Set #imgKey = :imgValue',
            ReturnValues:"ALL_NEW"
        };
        const response = await updateFormData(params);
        return Promise.resolve(response.Attributes);
    } catch (error) {
        return Promise.reject(error);
    }
};

module.exports = { updateForm };