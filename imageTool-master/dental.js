const AWS = require('aws-sdk');
const jimp = require('jimp');
const axios = require('axios');
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-2' });

const cloudfrontURL = process.env.CLOUDFRONT_URL || 'https://d1czbxowbjd7i2.cloudfront.net';
const tableName = process.env.TABLE_NAME || 'formdata';

if (!process.env.NODE_ENV) {
    require('dotenv').config()
    AWS.config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY_ID,
    };
}

const bucketName = process.env.BUCKET_NAME ? process.env.BUCKET_NAME : "dental-images";

const randomString = () => {
    return (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
};

const getImageInstance = async (imagePath) => {
    try {
        const image = await jimp.read(imagePath);
        // console.log(image.getMIME());
        // image.rotate( 270 );
        return Promise.resolve(image)
    } catch (error) {
        console.error("Error getting image size: ", error);
        return Promise.reject(error)
    }
}

const getImageSize = async (imagePath) => {
    try {
        const image = await jimp.read(imagePath)
        const size = {width: image.bitmap.width, height: image.bitmap.height}
        return Promise.resolve(size)
    } catch (error) {
        console.error("Error getting image size: ", err);
        return Promise.reject(error)
    }
}

const getFaceDetailsFromImage = async (...inputParams) => {
    const [bucketName, imageKeyPath] = inputParams
    return new Promise((resolve, reject) => {
        const params = {
            Image: {
                S3Object: {
                    Bucket: bucketName,
                    Name: imageKeyPath
                }
            },
            Attributes: [
                "ALL"
            ]
        }
        const rekognition = new AWS.Rekognition();
        rekognition.detectFaces(params, (error, response) => {
            if (error) {
                return reject(error)
            }
            // console.log("response.FaceDetails", JSON.stringify(response.FaceDetails));
            // console.log("BoundingBox", JSON.stringify(response.FaceDetails[0].BoundingBox));
            // console.log("Landmarks", JSON.stringify(response.FaceDetails[0].Landmarks));
            // console.log("Pose", JSON.stringify(response.FaceDetails[0].Pose));
            // console.log("Quality", JSON.stringify(response.FaceDetails[0].Quality));
            // console.log("Confidence", JSON.stringify(response.FaceDetails[0].Confidence));

            return resolve(response.FaceDetails)
        })
    })
}

const getImageDetailsFromS3 = async (...inputParams) => {
    const [bucketName, imageKeyPath] = inputParams;
    try {
        const paramS3 = {
            Bucket: bucketName,
            Key: imageKeyPath
        };
        // console.log("Get paramS3", paramS3)
        const s3 = new AWS.S3();
        const data = await s3.getObject(paramS3).promise();
        return Promise.resolve(data);
    } catch (error) {
        console.error("Error s3 get image details: ", error);
        return Promise.reject(error)
    }
}

const uploadImageToS3 = async (...inputParams) => {
    const [bucketName, imageKeyPath, bufferData, imageContentType] = inputParams
    try {
        const paramS3 = {
            Bucket: bucketName,
            Key: imageKeyPath,
            Body: bufferData,
            ContentType: imageContentType
        };
        // console.log("upload paramS3: ", paramS3);
        const s3 = new AWS.S3();
        const data = await s3.upload(paramS3).promise();
        const url = `${cloudfrontURL}/${data.Key}`;
        return Promise.resolve(url);
    } catch (error) {
        console.error("Error s3 upload to s3: ", error);
        return Promise.reject(error)
    }
}

const getFormDataByFormId = async (formID) => {
    try {
        const params = {
            TableName: tableName,
            Key: {
                formId: formID
            }
        }
        const documentClient = new AWS.DynamoDB.DocumentClient();
        const response = await documentClient.get(params).promise();
        return Promise.resolve(response.Item)
    } catch (dbError){
        console.error(dbError)
        let errorResponse = `Error: Execution update, caused a Dynamodb error, please look at your logs.`;
        if (dbError.code === 'ValidationException') {
            if (dbError.message.includes('reserved keyword')) errorResponse = `Error: You're using AWS reserved keywords as attributes`;
        }
        return Promise.reject(errorResponse)
    }
}

const updateFormDetailsToDynamoDB = async (params) => {
    try {
        const documentClient = new AWS.DynamoDB.DocumentClient();
        const response = await documentClient.update(params).promise()
        return Promise.resolve(response)
    } catch (dbError) {
        console.error(dbError)
        let errorResponse = `Error: Execution update, caused a Dynamodb error, please look at your logs.`;
        if (dbError.code === 'ValidationException') {
            if (dbError.message.includes('reserved keyword')) errorResponse = `Error: You're using AWS reserved keywords as attributes`;
        }
        return Promise.reject(errorResponse)
    }
}

const getCropCoordinates = async (...inputParams) => {
    try {
        const [imageInstance, faceDetail, isError] = inputParams;
        // Uploded image width height
        const imageWidth = imageInstance.bitmap.width;
        const imageHeight = imageInstance.bitmap.height;
        console.log("imageWidth:" + imageWidth + ", imageHeight:" + imageHeight);

        const coordinates = {};
        if (isError) {
            const faceDetailMidJawlineLeft = faceDetail.Landmarks.filter(o => o.Type === "midJawlineLeft");
            const faceDetailMidJawlineRight = faceDetail.Landmarks.filter(o => o.Type === "midJawlineRight");
            const faceDetailNoseLeft = faceDetail.Landmarks.filter(o => o.Type === "noseLeft");
            const faceDetailNose = faceDetail.Landmarks.filter(o => o.Type === "nose");
            const faceDetailChinBottom = faceDetail.Landmarks.filter(o => o.Type === "chinBottom");
            const faceDetailMouthDown = faceDetail.Landmarks.filter(o => o.Type === "mouthDown");

            // Find x and y point from where the cropping needs to be started
            coordinates.xPoint = Math.round(faceDetailMidJawlineLeft[0].X * imageWidth);
            coordinates.yPoint = Math.round(faceDetailNoseLeft[0].Y * imageHeight);

            coordinates.objPercentageWidth = (faceDetailMidJawlineRight[0].X - faceDetailMidJawlineLeft[0].X)
            console.log('ObjWidth: ',coordinates.objPercentageWidth * 100, '%')
            coordinates.width = Math.round(imageWidth - coordinates.xPoint)

            const faceDetailChinBottomHeight = faceDetailChinBottom[0].Y * imageHeight;
            const faceDetailFaceDetailNoseHeight = faceDetailNose[0].Y * imageHeight;
            const faceDetailMouthDownHeight = faceDetailMouthDown[0].Y * imageHeight;
            // console.info("faceDetailChinBottomHeight: ", faceDetailChinBottomHeight);
            // console.info("faceDetailFaceDetailNoseHeight: ", faceDetailFaceDetailNoseHeight);
            // console.info("faceDetailMouthDownHeight: ", faceDetailMouthDownHeight);
            coordinates.height = Math.round(faceDetailMouthDownHeight - faceDetailFaceDetailNoseHeight);
        } else {
            // Coordinates for the cropping
            const faceDetailMouthLeft = faceDetail.Landmarks.filter(o => o.Type === "mouthLeft");
            const faceDetailMouthRight = faceDetail.Landmarks.filter(o => o.Type === "mouthRight");
            const faceDetailMouthUp = faceDetail.Landmarks.filter(o => o.Type === "mouthUp");
            const faceDetailMouthDown = faceDetail.Landmarks.filter(o => o.Type === "mouthDown");
            const faceDetailNose = faceDetail.Landmarks.filter(o => o.Type === "nose");
            const faceDetailChinBottom = faceDetail.Landmarks.filter(o => o.Type === "chinBottom");
            // Find x and y point from where the cropping needs to be started
            /* uncomment this if crop goes wrong
            coordinates.xPoint = Math.round((faceDetailMouthLeft[0].X * imageWidth) - 60);
            coordinates.yPoint = Math.round((faceDetailMouthUp[0].Y * imageHeight) - 60);*/
            // Subtract 5% into X & Y cordinates
            coordinates.xPoint = Math.round(((faceDetailMouthLeft[0].X - 0.07) * imageWidth));
            coordinates.yPoint = Math.round(((faceDetailMouthUp[0].Y - 0.07) * imageHeight));

            coordinates.objPercentageWidth = (faceDetailMouthRight[0].X - faceDetailMouthLeft[0].X)
            console.log('ObjWidth: ',coordinates.objPercentageWidth * 100, '%')
            /* uncomment this if crop goes wrong
            coordinates.width = Math.round(coordinates.objPercentageWidth * imageWidth + 120)*/
            // Add 7% into width
            coordinates.width = Math.round((coordinates.objPercentageWidth + 0.10) * imageWidth)
            // const height = (((faceDetailMouthDown[0].Y - faceDetailMouthUp[0].Y) * imageHeight) + 30)
            coordinates.height = Math.round(((faceDetailChinBottom[0].Y - faceDetailNose[0].Y) * imageHeight));
            /* Pass it without crop if something goes wrong */
        }
        return Promise.resolve(coordinates);
    } catch (error) {
        return Promise.reject(error);
    }
}

const handleError = async (...inputParams) => {
    const [imageInstance, faceDetail, imageDetailsBody] = inputParams;
    console.info("Inside handleError");
    try {
        const cropCoordinates = await getCropCoordinates(imageInstance, faceDetail, true);
        const crop = await imageInstance.crop( cropCoordinates.xPoint, cropCoordinates.yPoint, cropCoordinates.width, cropCoordinates.height );
        const mimeType = crop._originalMime;
        const buffer = crop.getBufferAsync(mimeType)
        return Promise.resolve(buffer)
    } catch (error) {
        console.log("Skipping crop..", error);
        return Promise.resolve(imageDetailsBody);
    }
}

const cropImage = async (...inputParams) => {
    const [imageInstance, faceDetail, imageDetailsBody] = inputParams
    try {
        const cropCoordinates = await getCropCoordinates(imageInstance, faceDetail, false);
        console.log("crop coordinates: ", cropCoordinates)
        
        // Handling for exception if negative width/height or object percentage less than 7%
        if(cropCoordinates.width <=0 || cropCoordinates.height <= 0 || cropCoordinates.objPercentageWidth * 100 <= 7) {
            return Promise.resolve(imageDetailsBody)
        }
        // cropCoordinates.height = 1500;
        const crop = await imageInstance.crop( cropCoordinates.xPoint, cropCoordinates.yPoint, cropCoordinates.width, cropCoordinates.height );
        //rotate(jimp.AUTO)
        // const crop = await imageInstance.crop( xPoint, yPoint, width, height ).write("image/crop22.jpeg"); // to save on local
        // return Promise.resolve(true)
        const mimeType = crop._originalMime;
        const buffer = crop.getBufferAsync(mimeType)
        return Promise.resolve(buffer)

    } catch (error) {
        /* pass image without crop if any exception */
        console.log("cropImage error..", error);
        return handleError(imageInstance, faceDetail, imageDetailsBody);
    }
}

module.exports.processImage = async (event) => {
    try {
        let response;
        console.log("event.Records[0].s3: ", event.Records[0].s3)
        let originalImageKeyPath = event.Records[0].s3.object.key;
        originalImageKeyPath = originalImageKeyPath.replace("%40", "@")
        const keyPathArray = originalImageKeyPath.split('/');
        const userEmail = keyPathArray[1];
        const formId = keyPathArray[2];
        const fileName = keyPathArray[3].replace("orig", "crop");
        const fileExtension = keyPathArray[3].split('.').pop();
        const imageContentType = `image/${fileExtension}`;
        const croppedImageKeyPath = `cropped/${userEmail}/${formId}/${fileName}`;

        const imageDetails = await getImageDetailsFromS3(bucketName, originalImageKeyPath)
        const imageDetailsBody = imageDetails.Body
        const imageInstance = await getImageInstance(imageDetails.Body)
        const faceDetails = await getFaceDetailsFromImage(bucketName, originalImageKeyPath)
        /* Check if no response from image then pass it without crop */
        console.log('len=',faceDetails.length)
        const croppedImage = (faceDetails.length > 0) ? await cropImage(imageInstance, faceDetails[0], imageDetailsBody) : imageDetailsBody;
        // return Promise.resolve(croppedImage);
        const croppedCloudfrontUrl = await uploadImageToS3(bucketName, croppedImageKeyPath, croppedImage, imageContentType);
        console.log("croppedCloudfrontUrl: ", croppedCloudfrontUrl)
        
        console.log("formId: ", formId);
        /* Now I'm handling collage creation with cron */

        // const formDetail = await getFormDataByFormId(formId);
        // const images = formDetail.images;
        // // console.log("images: ", images)
        // images.cropped = images.cropped ? images.cropped : [];
        // images.cropped.push(croppedCloudfrontUrl);
        // images.cropped = images.cropped.filter((v, i, a) => a.indexOf(v) === i);
        // const croppedParams = {
        //     TableName: tableName,
        //     Key: {
        //         "formId": formId
        //     },
        //     ExpressionAttributeNames: {
        //         "#imgKey": "images"
        //     }, 
        //     ExpressionAttributeValues: {
        //         ":imgValue": images
        //     },
        //     UpdateExpression: 'Set #imgKey = :imgValue',
        //     ReturnValues:"ALL_NEW"
        // };
        // response = await updateFormDetailsToDynamoDB(croppedParams);

        // const originalImages = response.Attributes.images.original;
        // const croppedImages = response.Attributes.images.cropped;
        // // if last image is cropped for particular form create collage and upload to s3 and database
        // console.log(originalImages.length ,'===', croppedImages.length);
        // if (originalImages.length === croppedImages.length) {
        //     response = await axios.get(`http://localhost:8080/api/form/${formId}/collage`, {
        //         headers: {
        //             'x-api-key': 'DOBiJWQxIS9zKym8palPM6B5xX1tXiaF8SdLR3gp'
        //         }
        //     })
        //     return Promise.resolve(response.data);
        // }
        return Promise.resolve(croppedCloudfrontUrl);
    } catch (error) {
        console.error(error);
        return Promise.reject(error)
    }
}
