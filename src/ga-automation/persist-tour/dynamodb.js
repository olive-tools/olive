const { DynamoDbAdapter } = require("../../shared/dynamoDbAdapter");
const { config } = require('../config');
const dynamoDbAdapter = new DynamoDbAdapter();

async function persistTour(object) {
    const result = await dynamoDbAdapter.putItemFromObjet(config.toursTableName, object);
    return result;
}

module.exports = { persistTour };
