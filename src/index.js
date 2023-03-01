const QRCode = require("qrcode");
const uuid = require("uuid");
const { isValidAuth } = require("./auth");
const { DynamoDbAdapter } = require("./dynamoDbAdapter");
const dynamoDbAdapter = new DynamoDbAdapter();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { region } = require("./config");
const s3 = new S3Client({ region });

async function handler(event) {
  // TODO: Dispatch hit count async sns -> sqs -> lambda
  const item = dynamoDbAdapter.getSingleByPK(
    { id: event.pathParameters.id },
    process.env.QRCODE_TABLE_NAME
  );
  if (!item) {
    return {
      statusCode: 404,
    };
  }
  const redirectUrl = item.redirectUrl.S;
  return {
    statusCode: 200,
    headers: {
      "content-type": "text/html",
    },
    body: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8"/>
        <title>olive</title>
        <meta http-equiv="refresh" content="0; URL='${redirectUrl}'"/>
    </head>
    <body>
    ...
    </body>
    </html>
    `,
  };
}

// TODO: sqs event
async function hitHandler(event) {
  const hit = {
    id: "",
    dateTime: "",
  };
}

async function qrcodeHandler(event) {
  if (!isValidAuth(event.headers.authorization)) {
    return {
      statusCode: 401,
    };
  }
  const { name, redirectUrl } = JSON.parse(event.body);
  // TODO: validate redirect url
  const id = uuid.v4();
  const oliveUrl = "https://api.olivetrees.com.br";
  const qrcodeBuffer = await QRCode.toBuffer(`${oliveUrl}/qrcode/${id}`, {
    type: "png",
  });
  const bucketParams = {
    Bucket: process.env.QRCODE_BUCKET_NAME,
    Key: `${id}.png`,
    Body: qrcodeBuffer,
  };
  const command = new PutObjectCommand(bucketParams);
  const putObjectOutput = await s3.send(command);
  console.log(JSON.stringify(putObjectOutput));
  const oliveQRCode = {
    id,
    createdAt: Date.now(),
    name,
    redirectUrl,
  };

  const result = await dynamoDbAdapter.putShallowItem(
    process.env.QRCODE_TABLE_NAME,
    oliveQRCode
  );
  console.log(JSON.stringify(result));
  return {
    statusCode: 200,
    body: JSON.stringify({ id }),
  };
}

module.exports = { handler, qrcodeHandler };
