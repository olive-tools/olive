const {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} = require("@aws-sdk/client-dynamodb");

class DynamoDbAdapter {
  #dynamoDb;

  constructor(dynamoDb = new DynamoDBClient({ region: "us-east-1" })) {
    this.#dynamoDb = dynamoDb;
  }

  async getSingleByPK(tableName, partitionKey) {
    const items = await this.getByPK(tableName, partitionKey);
    const [item] = items;
    return item;
  }

  async getByPK(tableName, partitionKey) {
    const keys = Object.keys(partitionKey);
    if (keys.length > 1) {
      throw new Error(`only one key is permitted ${JSON.stringify(keys)}`);
    }
    const [keyName] = keys;
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "#keyName = :keyValue",
      ExpressionAttributeNames: {
        "#keyName": keyName,
      },
      ExpressionAttributeValues: {
        ":keyValue": { S: partitionKey[keyName] },
      },
    });
    const { Items } = await this.#dynamoDb.send(command);
    if (Items.length === 0) {
      return undefined;
    }
    return Items;
  }

  async putItemFromObjet(tableName, item) {
    const dynamoDBItem = this.#buildDynamoItemFromObject(item);

    const dynamoCommand = new PutItemCommand({
      TableName: tableName,
      Item: dynamoDBItem,
    });
    return this.#dynamoDb.send(dynamoCommand);
  }

  #buildDynamoItemFromObject(item) { //to be complete, function should cover keys which are arrays -> https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html#HowItWorks.DataTypeDescriptors
    let dynamoDBItem = {};
    for (let key of Object.keys(item)) {
      if (typeof item[key] == 'object') {
        dynamoDBItem = {
          ...dynamoDBItem,
          [key]: { 'M': this.#buildDynamoItemFromObject(item[key]) }
        }
        continue;
      }
      dynamoDBItem = {
        ...dynamoDBItem,
        [key]: { [this.#getDynamoDbDataType(item[key])]: `${item[key]}` },
      };
    }

    return dynamoDBItem;
  }

  #getDynamoDbDataType(value) {
    switch (typeof value) {
      case "undefined":
        return "NULL";
      case "null":
        return "NULL";
      case "string":
        return "S";
      case "symbol":
        return "S";
      case "number":
        return "N";
      case "bigint":
        return "N";
      case "boolean":
        return "BOOL";
      default:
        throw new Error("Not implemented");
    }
  }
}

module.exports = { DynamoDbAdapter };
