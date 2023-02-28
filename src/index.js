let QRCode = require('qrcode');
let uuid = require('uuid');
let isValidAuth = require('./auth').isValidAuth;
const {S3Client, PutObjectCommand} = require("@aws-sdk/client-s3");
const {DynamoDBClient, PutItemCommand, QueryCommand} = require("@aws-sdk/client-dynamodb");
const region = 'us-east-1';
const s3 = new S3Client({region});
const dynamoDb = new DynamoDBClient({region});

async function handler(event) {
  // TODO: Dispatch hit count async sns -> sqs -> lambda
  const command = new QueryCommand({
    'TableName': process.env.QRCODE_TABLE_NAME,
    'KeyConditionExpression': '#idName = :idValue',
    'ExpressionAttributeNames': {
      '#idName': 'id'
    },
    'ExpressionAttributeValues': {
      ':idValue': {'S': event.pathParameters.id}
    }
  });
  const {Items} = await dynamoDb.send(command);
  if (Items.length === 0) {
    return {
      statusCode: 404
    }
  }
  const [item] = Items;
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
    id: '',
    dateTime: '',
  }
}

async function qrcodeHandler(event) {
  if (!isValidAuth(event.headers.authorization)) {
    return {
      statusCode: 401
    };
  }
  const {name, redirectUrl} = JSON.parse(event.body);
  // TODO: validate redirect url
  const id = uuid.v4();
  const oliveUrl = 'https://api.olivetrees.com.br';
  const qrcodeBuffer = await QRCode.toBuffer(`${oliveUrl}/${id}`, {type: 'png'});
  const bucketParams = {
    Bucket: process.env.QRCODE_BUCKET_NAME,
    Key: `${id}.png`,
    Body: qrcodeBuffer
  }
  const command = new PutObjectCommand(bucketParams);
  const putObjectOutput = await s3.send(command);
  console.log(JSON.stringify(putObjectOutput));
  const oliveQRCode = {
    id, createdAt: Date.now(), name, redirectUrl
  };
  const dynamoCommand = new PutItemCommand({
    "TableName": process.env.QRCODE_TABLE_NAME,
    'Item': {
      "id": {
        "S": oliveQRCode.id
      },
      "createdAt": {
        'N': `${oliveQRCode.createdAt}`
      },
      'name': {
        'S': oliveQRCode.name
      },
      'redirectUrl': {
        'S': oliveQRCode.redirectUrl
      }
    }
  });
  const result = await dynamoDb.send(dynamoCommand);
  console.log(JSON.stringify(result));
  return {
    statusCode: 200
  };
}

module.exports = {handler, qrcodeHandler};
