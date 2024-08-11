const index = require('./index');
const init = async() => {
    try {
        const data = await index.handler();
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}

init();