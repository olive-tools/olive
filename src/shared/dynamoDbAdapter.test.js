const { DynamoDbAdapter } = require("./dynamoDbAdapter");

test("should send put item command", async () => {
  const dynamoDbMock = {
    send: jest.fn(() => {
      return Promise.resolve();
    }),
  };
  await new DynamoDbAdapter(dynamoDbMock).putItemFromObjet("qrcode", {
    id: "hsuahs123413dd32",
    name: "my_link",
    createdAt: 2293293,
    redirectUrl: "https://example.com",
  });

  expect(dynamoDbMock.send).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        TableName: "qrcode",
        Item: {
          id: { S: "hsuahs123413dd32" },
          name: { S: "my_link" },
          createdAt: { N: "2293293" },
          redirectUrl: { S: "https://example.com" },
        },
      },
    })
  );
});

test("should send put item command with nested objects", async () => {
  const dynamoDbMock = {
    send: jest.fn(() => {
      return Promise.resolve();
    }),
  };
  await new DynamoDbAdapter(dynamoDbMock).putItemFromObjet("qrcode", {
    id: "hsuahs123413dd32",
    name: "my_link",
    createdAt: 2293293,
    redirectUrl: "https://example.com",
    nested: {
      nestedName: "NESTED",
      nestedNumber: 2293293,
    }
  });

  expect(dynamoDbMock.send).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        TableName: "qrcode",
        Item: {
          id: { S: "hsuahs123413dd32" },
          name: { S: "my_link" },
          createdAt: { N: "2293293" },
          redirectUrl: { S: "https://example.com" },
          nested: {
            M: {
              nestedName: { S: "NESTED" },
              nestedNumber: { N: "2293293" }
            }
          }
        },
      },
    })
  );
});

test("should send query command", async () => {
  const dynamoDbMock = {
    send: jest.fn(() => {
      return Promise.resolve({ Items: [{}] });
    }),
  };
  await new DynamoDbAdapter(dynamoDbMock).getSingleByPK("qrcode", {
    id: "hsuahs123413dd32",
  });

  expect(dynamoDbMock.send).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        TableName: "qrcode",
        KeyConditionExpression: "#keyName = :keyValue",
        ExpressionAttributeNames: {
          "#keyName": "id",
        },
        ExpressionAttributeValues: {
          ":keyValue": { S: "hsuahs123413dd32" },
        },
      },
    })
  );
});
