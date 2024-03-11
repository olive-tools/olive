const dynamoDbAdapter = require("../../shared/dynamoDbAdapter");
const { config } = require('../config');

async function persistTour(object) {
    const result = await dynamoDbAdapter.putItemFromObjet(config.toursTableName, object);
    return result;
}

module.exports = { persistTour };
