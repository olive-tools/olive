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

  async getByPKAsJson(tableName, partitionKey) {
    const dynamoItems = await this.getByPK(tableName, partitionKey);
    if (!dynamoItems) {
      return [];
    }
    return this.#convertDynamoItemsToJSON(dynamoItems);
  }

  #convertDynamoItemsToJSON(items) {
    return items.map(item => {
      const jsonItem = {};
      for (const [key, value] of Object.entries(item)) {
        const dataType = Object.keys(value)[0];
        const dataValue = value[dataType];
        if (dataType === 'M') {
          jsonItem[key] = this.#convertDynamoItemsToJSON([dataValue])[0];
        } else if (dataType === 'L') {
          jsonItem[key] = dataValue.map(listItem => {
            const itemType = Object.keys(listItem)[0];
            const itemValue = listItem[itemType];
            if (itemType === 'M') {
              return this.#convertDynamoItemsToJSON([itemValue])[0];
            } else {
              return itemValue;
            }
          });
        } else {
          jsonItem[key] = dataValue;
        }
      }
      return jsonItem;
    });
  }

  async putItemFromObjet(tableName, item) {
    const dynamoDBItem = this.#buildDynamoItemFromObject(item);

    const dynamoCommand = new PutItemCommand({
      TableName: tableName,
      Item: dynamoDBItem,
    });
    return this.#dynamoDb.send(dynamoCommand);
  }

  #buildDynamoItemFromObject(item) { // this function does not handle complex types like set, list of lists, etc.
    let dynamoDBItem = {};
    for (let key of Object.keys(item)) {
      if (Array.isArray(item[key])) {
        dynamoDBItem = {
          ...dynamoDBItem,
          [key]: {
            'L': item[key].map(arrayItem => {
              if (typeof arrayItem === 'object' && arrayItem !== null) {
                return { 'M': this.#buildDynamoItemFromObject(arrayItem) };
              } else {
                return { [this.#getDynamoDbDataType(arrayItem)]: `${arrayItem}` };
              }
            })
          }
        }
      } else if (typeof item[key] == 'object' && item[key] !== null) {
        dynamoDBItem = {
          ...dynamoDBItem,
          [key]: { 'M': this.#buildDynamoItemFromObject(item[key]) }
        }
      } else {
        dynamoDBItem = {
          ...dynamoDBItem,
          [key]: { [this.#getDynamoDbDataType(item[key])]: `${item[key]}` },
        };
      }
    }

    return dynamoDBItem;
  }

  #getDynamoDbDataType(value) {
    if (value === null || value === undefined) {
      return "NULL";
    }
    switch (typeof value) {
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
