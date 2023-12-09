const {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} = require("@aws-sdk/client-dynamodb");
const { region } = require("./config");

class DynamoDbAdapter {
  #dynamoDb;

  constructor(dynamoDb = new DynamoDBClient({ region })) {
    this.#dynamoDb = dynamoDb;
  }

  async getSingleByPK(tableName, partitionKey) {
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
    if (Items.length > 1) {
      throw new Error("More than one item returned");
    }
    if (Items.length === 0) {
      return undefined;
    }
    const [item] = Items;
    return item;
  }

  async putShallowItem(tableName, item) {
    const dynamoDBItem = Object.keys(item).reduce(
      (dynamoDBItem, key) => ({
        ...dynamoDBItem,
        [key]: { [this.#getDynamoDbDataType(item[key])]: `${item[key]}` },
      }),
      {}
    );

    const dynamoCommand = new PutItemCommand({
      TableName: tableName,
      Item: dynamoDBItem,
    });
    return this.#dynamoDb.send(dynamoCommand);
  }

  #getDynamoDbDataType(value) {
    switch (typeof value) {
      case "undefined":
        return "NULL";
      case "string":
        return "S";
      case "number":
        return "N";
      case "bigint":
        return "N";
      default:
        throw new Error("Not implemented");
    }
  }
}

module.exports = { DynamoDbAdapter };
