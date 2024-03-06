const { DynamoDbAdapter } = require("../../shared/dynamoDbAdapter");
const dynamoDbAdapter = new DynamoDbAdapter();

async function persistTour(object) {
    const result = await dynamoDbAdapter.putItemFromObjet(qrcodeTable, oliveQRCode);
    return result;
}

module.exports = { persistTour };
