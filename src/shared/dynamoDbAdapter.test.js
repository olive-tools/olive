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

test("should send put item command with array of objects", async () => {
  const dynamoDbMock = {
    send: jest.fn(() => {
      return Promise.resolve();
    }),
  };
  await new DynamoDbAdapter(dynamoDbMock).putItemFromObjet("buggy-tours", {
    tourId: "tour123",
    tourDate: "24/07/2025",
    passengers: [
      {
        fullName: "John Doe",
        birthday: "24/07/1996",
        cpf: "123456789",
        phoneNumber: "81999998888"
      },
      {
        fullName: "Jane Smith",
        birthday: "26/07/1996",
        cpf: "987654321",
        phoneNumber: "8199997777"
      }
    ]
  });

  expect(dynamoDbMock.send).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        TableName: "buggy-tours",
        Item: {
          tourId: { S: "tour123" },
          tourDate: { S: "24/07/2025" },
          passengers: {
            L: [
              {
                M: {
                  fullName: { S: "John Doe" },
                  birthday: { S: "24/07/1996" },
                  cpf: { S: "123456789" },
                  phoneNumber: { S: "81999998888" }
                }
              },
              {
                M: {
                  fullName: { S: "Jane Smith" },
                  birthday: { S: "26/07/1996" },
                  cpf: { S: "987654321" },
                  phoneNumber: { S: "8199997777" }
                }
              }
            ]
          }
        },
      },
    })
  );
});

test("should send put item command with array of primitive values", async () => {
  const dynamoDbMock = {
    send: jest.fn(() => {
      return Promise.resolve();
    }),
  };
  await new DynamoDbAdapter(dynamoDbMock).putItemFromObjet("test-table", {
    id: "test123",
    tags: ["tag1", "tag2", "tag3"],
    numbers: [1, 2, 3]
  });

  expect(dynamoDbMock.send).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        TableName: "test-table",
        Item: {
          id: { S: "test123" },
          tags: {
            L: [
              { S: "tag1" },
              { S: "tag2" },
              { S: "tag3" }
            ]
          },
          numbers: {
            L: [
              { N: "1" },
              { N: "2" },
              { N: "3" }
            ]
          }
        },
      },
    })
  );
});
