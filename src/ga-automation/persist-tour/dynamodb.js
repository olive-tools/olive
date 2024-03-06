const { DynamoDbAdapter } = require("../../shared/dynamoDbAdapter");
const { getConfig } = require('../config');
const dynamoDbAdapter = new DynamoDbAdapter();

async function persistTour(object) {
    const result = await dynamoDbAdapter.putItemFromObjet(getConfig().toursTableName, object);
    return result;
}

module.exports = { persistTour };
