const processResponse = require('./process-response.js');
const { saveForm } = require('./form');
const IS_CORS = true;

exports.handler = async event => {
    if (event.httpMethod === 'OPTIONS') {
        return processResponse(IS_CORS);
    }
    if (!event.body) {
        return processResponse(IS_CORS, {statusCode: 400, error: 'payload required'}, 400);
    }
    const item = JSON.parse(event.body);
    
    if (!item.name) {
        return processResponse(IS_CORS, {statusCode: 400, error: 'Name required.'}, 400);
    }
    if (!item.email) {
        return processResponse(IS_CORS, {statusCode: 400, error: 'Email required'}, 400);
    }
    if (!item.phonenumber) {
        return processResponse(IS_CORS, {statusCode: 400, error: 'Phone Number required.'}, 400);
    }
    if (!item.zipcode) {
        return processResponse(IS_CORS, {statusCode: 400, error: 'Zipcode required'}, 400);
    }
    if (!item.treatmentGoal) {
        return processResponse(IS_CORS, {statusCode: 400, error: 'Treatment Goal field required'}, 400);
    }
    if (!item.treatmentStart) {
        return processResponse(IS_CORS, {statusCode: 400, error: 'Treatment Start field required'}, 400);
    }
    if (item.dentistInMind == "Yes" && !item.dentistName) {
        return processResponse(IS_CORS, {statusCode: 400, error: 'Dentist Name field required'}, 400);
    }
    if (item.dentistInMind == "Yes" && !item.dentistCity) {
        return processResponse(IS_CORS, {statusCode: 400, error: 'Dentist City field required'}, 400);
    }
    if (item.dentistInMind == "Yes" && !item.dentistState) {
        return processResponse(IS_CORS, {statusCode: 400, error: 'Dentist State field required'}, 400);
    }
    if (item.dentistInMind == "No" && !item.dentistChoiceHelp) {
        return processResponse(IS_CORS, {statusCode: 400, error: 'Dentist Choice Help field required'}, 400);
    }
    try {
        const response = await saveForm(item);
        return processResponse(IS_CORS, response, 200);
    } catch (error) {
        return processResponse(IS_CORS, error, 500);
    }
};