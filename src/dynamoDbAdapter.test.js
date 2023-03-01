const { PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDbAdapter } = require("./dynamoDbAdapter");

test("should send put item command", async () => {
  const dynamoDbMock = {
    send: jest.fn(() => {
      return Promise.resolve();
    }),
  };
  await new DynamoDbAdapter(dynamoDbMock).putShallowItem("qrcode", {
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
