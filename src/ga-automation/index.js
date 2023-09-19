const { isValidAuth } = require('../auth');

async function formSubmitHandler(event) {
    if (!isValidAuth(event.headers.authorization)) {
        return {
            statusCode: 401,
        };
    }
    const row = JSON.parse(event.body).event.values;
    return {
        statusCode: 200,
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(row)
    };
}

module.exports = { formSubmitHandler };