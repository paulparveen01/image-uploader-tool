const express = require('express');
const router = express.Router()

const gm = require('gm').subClass({imageMagick: true});
const jo = require('jpeg-autorotate');

const AWS = require('aws-sdk')
const { getFormsWithoutCollage, GetFormDataByFormId, UpdateFormData } = require('./dynamodb')
const utils = require("./utils");
// const createCollage = require("@settlin/collage");
const { createCollageLib } = require('./collage')

AWS.config.update({ region: process.env.AWS_REGION || 'us-east-2' });
const cloudfrontURL = process.env.CLOUDFRONT_URL || 'https://d1czbxowbjd7i2.cloudfront.net';
const bucketName = process.env.BUCKET_NAME ? process.env.BUCKET_NAME : "dental-images";
const tableName = process.env.TABLE_NAME || 'formdata';

const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC0cc436b1d21679724fdf76673bd88e25';
const authToken = process.env.TWILIO_AUTH_TOKEN || '6122015fa7e42dc3484adbfdebbf40cc';
const twilio = require('twilio')(accountSid, authToken);

const nodemailer = require("nodemailer");

// if (!process.env.NODE_ENV) {
//     require('dotenv').config()
//     AWS.config.credentials = {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.SECRET_ACCESS_KEY_ID,
//     };
// }

const randomString = () => {
    return (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
};

const createImagesCollage = (images) => {
    const epLogo = 'https://d1czbxowbjd7i2.cloudfront.net/assets/ep-logo.png';
    const smileLogo = 'https://d1czbxowbjd7i2.cloudfront.net/assets/6MS_Logo.png';
    // Logic to insert logo at 7th & 9th position of collage
    // if(images.length == 7) { // right now we have total 7 images
    //    const removedImg = images.splice(6, 1, smileLogo); // it will remove image from 6th index & replace with logo
    //    images.push(removedImg.join(),smileLogo);
    // }
    /* push logo in collage image array*/
    images.push(smileLogo,epLogo);

    const options = {
        sources: [
            images[3], //Right Side
            images[1], //Front Side
            images[2], //Left side
            images[7],
            images[0], //Exaggerated Smile
            images[8],
            images[4], //Upper arch
            images[6], //Chin up
            images[5], //lower arch
        ],
        width: 3, // number of images per row
        height: 3, // number of images per column
        imageWidth: 400, // width of each image
        imageHeight: 400, // height of each image
        spacing: 2, // optional: pixels between each image
        backgroundColor: '#FFDBAC',
        borderColor: '#fff',
    };

    return createCollageLib(options)
    .then((canvas) => {
        const imageBuffer = canvas.toBuffer();
        return imageBuffer;
    });
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

const processCollageImage = async (formDetail) => {
    try {
        const croppedImageBufferData = await createImagesCollage(formDetail.images.cropped);
        const uniqueString = randomString();
        const fileName = "collage_" + uniqueString +".jpeg";
        const imageContentType = `image/jpeg`;
        const croppedImageKeyPath = `cropped/${formDetail.email}/${formDetail.formId}/${fileName}`;
        const imageUrl = await uploadImageToS3(bucketName, croppedImageKeyPath, croppedImageBufferData, imageContentType);
        
        const images = formDetail.images;
        images.collage = images.collage ? images.collage : []
        images.collage = imageUrl
        const params = {
            TableName: tableName,
            Key: {
                "formId": formDetail.formId
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
        
        const response = await UpdateFormData(params);
        /* Send Email to User after collage is ready */
        const emailParams = {
            name: formDetail.name, 
            email: formDetail.email,
            phonenumber: formDetail.phonenumber,
            zipcode: formDetail.zipcode,
            collage: imageUrl
        }
        const emailResponse = await sendEmail(emailParams);
        console.info("collage email response: ", emailResponse);
        return Promise.resolve(response)
    } catch (error) {
        return Promise.reject(error)
    }
}

const create = async (req, res) => {
    console.log(req.params)
    const formId = req.params.formid || "";
    try {
        if (!formId) {
            return Promise.reject({statusCode: 400, errmsg: "formid required."});
        }
        const result = await GetFormDataByFormId(formId);
        const formData = result.Item;
        const response = await processCollageImage(formData);
        return utils.returnResponse(res, response)
    } catch (error) {
        console.error(error)
        return utils.returnError(res, error);
    }
}

router.get("/:formid/collage", create)

const createFormCollage = async (req, res) => {
    try {
        const resp = await getFormsWithoutCollage();
        const items = resp.Items;
        const promise = items.reduce((prev, cur) => {
            if(cur.images.original.length === cur.images.cropped.length) {
                prev.push(processCollageImage(cur).catch(err => Promise.resolve(err)));
            }
            return prev;
        }, [])
        const response = await Promise.all(promise)
        return utils.returnResponse(res, "Ok");
    } catch (error) {
        console.error(error)
        return utils.returnError(res, error);
    }
}

router.get("/createcollage", createFormCollage)

const autoRotateImage = async (params) => {
    const base64ImageBuffer = Buffer.from(params.image.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const type = params.image.split(';')[0].split('/')[1];
    try {
        const reponse = await jo.rotate(base64ImageBuffer, {});
        console.log("response: ", response);
        console.log(`Orientation was ${reponse.orientation}`);
        console.log(`Dimensions after rotation: ${reponse.dimensions.width}x${reponse.dimensions.height}`);
        console.log(`Quality: ${reponse.quality}`);
        console.log("jpeg-autorotate buffer: ", reponse.buffer);
        return Promise.resolve({
            content_type: type,
            buffer_data: reponse.buffer
        });
    } catch (error) {
        console.log('jo.rotate error', error);
        return Promise.resolve({
            content_type: type,
            buffer_data: base64ImageBuffer
        });
    }
}

const autoRotateImageRoute = async (req, res) => {
    try {
        const response = await autoRotateImage(req.body);
        return utils.returnResponse(res, response);
    } catch (error) {
        console.log(error)
        return utils.returnError(res, error);
    }
}

router.post("/autoorientimage", autoRotateImageRoute) // this API is not using right now as we are managing autoorient on frontend

const sendMessage = async (body) => {
    const fromNumber = '+18443879922'; //toll free number //+12056279577(this number comes by default with twillio)
    const defaultMessage = "Please click on t.ly/al2T to fill assessment form  \n\nThank you\nSix Months Smiles\n\nReply STOP to unsubscribe.";
    const message = body.message ? body.message : defaultMessage;
    try {
        const params = {
            body: message,
            from: fromNumber,
            to: body.phoneNumber
        }
        const response = await twilio.messages.create(params);
        return Promise.resolve({
            sid: response.sid
        });
    } catch (error) {
        return Promise.reject(error);
    }
}
const sendMessageRoute = async (req, res) => {
    try {
        const response = await sendMessage(req.body);
        return utils.returnResponse(res, response);
    } catch (error) {
        console.error(error)
        return utils.returnError(res, error);
    }
}
router.post("/sendmessage", sendMessageRoute)

const sendEmail = async (body) => {
    const toUserName = body.name || '';
    const toUserEmail = body.email || '';
    const UserPhoneNumber = body.phonenumber || '';
    const UserZipcode = body.zipcode || '';
    const collageUrl = body.collage || '';
    const isCommEmail = body.commEmail || ''; // if request coming from step1 of form
    const formId = body.formId || '';
    if ( !toUserName ) {
        // return Promise.reject({statusCode: 400, errmsg: "Name is required."});
    }
    if ( !toUserEmail ) {
        return Promise.reject({statusCode: 400, errmsg: "Email is required."});
    }
    const footerContent = "<br/><br/>Thank you<br/>Six Months Smiles<br/>https://sixmonthsmiles.com";
    const toUserEmailSubject = "Your Assesment Form submitted.";
    const toUserEmailBody = `<b>Hello ${toUserName},</b><br/><br/>Excellent! Your Smile Gallery is in process.
    <br/><br/>A 6MS Smile Concierge will contact you within one business day.${footerContent}`;

    let additionalFormInfo = '';
    if( formId ) {
        const formIdResult = await GetFormDataByFormId(formId);
        // return Promise.resolve(formIdResult);
        const formItems = formIdResult.Item;
        const treatmentGoal = formItems.treatmentGoal.toString();
        const treatmentStart = formItems.treatmentStart;
        const dentistInMind = formItems.dentistInMind;
        additionalFormInfo = `<br/>Treatment Goal : ${treatmentGoal}<br/>Treatment Start : ${treatmentStart}`;

        if( dentistInMind == "Yes" ) {
            const dentistName = formItems.dentistName;
            const dentistCity = formItems.dentistCity;
            const dentistState = formItems.dentistState;
            additionalFormInfo += `<br/>Dentist Name : ${dentistName}<br/>Dentist City : ${dentistCity}<br/>Dentist State : ${dentistState}`;
        } else {
            const dentistChoiceHelp = formItems.dentistChoiceHelp;
            additionalFormInfo += `<br/>Dentist Choice Help Needed? : ${dentistChoiceHelp}`;
        }
    }
    const adminEmail = ["patientadvocate@sixmonthsmiles.com"];
    // const adminEmail = ["manojpaul143@gmail.com"];
    const adminEmailSubject = `${toUserName} Assesment completed`;
    const adminEmailBody = `${toUserName} has completed their Smile Selfie.
    <br/>Their details are as follows:<br/><br/>Name : ${toUserName}<br/>Email : ${toUserEmail}<br/>Phone : ${UserPhoneNumber}<br/>Zip Code : ${UserZipcode} ${additionalFormInfo}`;
    
    try {

        const transporter = nodemailer.createTransport({
            host: "outlook.office365.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: '6msEmailService@sixmonthsmiles.com',
                pass: '6MS3m@i!5vc',
            }
        });

        if( collageUrl ) {
            const collageEmailBody = `<b>Hello ${toUserName},</b><br/><br/>Your Smile Gallery is ready.
            <br/>This will be used to determine the best treatment for your new smile.
            <br/><br/><a href="${collageUrl}">Click here for gallery</a>
            <br/><br/>A 6MS Smile Concierge will be in touch with you within one business day.${footerContent}`;
            // Send e-mail to User with collage url
            const collageEmailResponse = await transporter.sendMail({
                from: '"Sixmonthsmiles " <6msEmailService@sixmonthsmiles.com>', // sender address
                to: toUserEmail, // list of receivers
                cc: adminEmail,
                subject: "Your Gallery is ready", // Subject line
                html: collageEmailBody, // html body
            });

            return Promise.resolve({
                collageEmailMessageId: collageEmailResponse.messageId
            });
        } else if (isCommEmail) {
            const commEmailBody = 'Please click on link to fill form https://d24e4p0y2o78hs.cloudfront.net';
            // Send e-mail to User with Assessment form link
            const commEmailResponse = await transporter.sendMail({
                from: '"Sixmonthsmiles " <6msEmailService@sixmonthsmiles.com>',
                to: toUserEmail,
                subject: "Link to Assessment form",
                html: commEmailBody,
            });

            return Promise.resolve({
                commEmailMessageId: commEmailResponse.messageId
            });
        } else {
            // send mail with defined transport object
            // Send e-mail to 6MS Admin
            const adminEmailResponse = await transporter.sendMail({
                from: '"Sixmonthsmiles " <6msEmailService@sixmonthsmiles.com>', // sender address
                to: adminEmail, // list of receivers
                subject: adminEmailSubject, // Subject line
                // text: "Hello world?", // plain text body
                html: adminEmailBody, // html body
            });

            // Send e-mail to User
            const userEmailResponse = await transporter.sendMail({
                from: '"Sixmonthsmiles " <6msEmailService@sixmonthsmiles.com>', // sender address
                to: toUserEmail, // list of receivers
                subject: toUserEmailSubject, // Subject line
                // text: "Hello world?", // plain text body
                html: toUserEmailBody, // html body
            });
            
            return Promise.resolve({
                adminMessageId: adminEmailResponse.messageId,
                userMessageId: userEmailResponse.messageId,
            });
        }
    } catch (error) {
        return Promise.reject(error);
    }
}

const sendEmailRoute = async (req, res) => {
    try {
        const response = await sendEmail(req.body);
        return utils.returnResponse(res, response);
    } catch (error) {
        console.error(error)
        return utils.returnError(res, error);
    }
}
router.post("/sendemail", sendEmailRoute)

module.exports = router;

