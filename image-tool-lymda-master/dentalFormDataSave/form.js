const { getFormDataByFormId, saveFormData } = require('./dynamodb');
const { uploadImagesToS3 } = require('./s3');

const randomString = () => {
    return (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
};

const saveForm = async (data) => {
    try {
        // const base64Images = data.images;
        const item = Object.assign({}, {name: data.name, email: data.email, phonenumber: data.phonenumber, zipcode: data.zipcode, frommobile: data.frommobile, treatmentGoal: data.treatmentGoal, treatmentStart: data.treatmentStart, dentistInMind: data.dentistInMind, dentistName: data.dentistName, dentistCity: data.dentistCity, dentistState: data.dentistState, dentistChoiceHelp: data.dentistChoiceHelp});
        item.formId = randomString();
        item.created = Math.floor(Date.now() / 1000);
        // const imageKeyPath = `original/${item.email}/${item.formId}`;
        // console.log("imageKeyPath: ", imageKeyPath);
        // const imageUrls = await uploadImagesToS3(imageKeyPath, base64Images);
        // console.log("imageUrls:", imageUrls);
        // item.images = {original: imageUrls};
        await saveFormData(item);
        return Promise.resolve({formId: item.formId});
    } catch (error) {
        return Promise.reject(error);
    }
};

module.exports = { saveForm };