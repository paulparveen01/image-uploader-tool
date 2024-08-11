const index = require('./index');
const event = require('./json/event.json');
const init = async() => {
    try {
        const data = await index.handler(event);
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}

init();