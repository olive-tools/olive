let QRCode = require('qrcode');
let uuid = require('uuid');
let isValidAuth = require('./auth').isValidAuth;
const {S3Client, PutObjectCommand} = require("@aws-sdk/client-s3");
const s3 = new S3Client({region: 'us-east-1'});

async function handler(event) {
  /* TODO:
  *   Link id in path param
  *   {id: 21hjg3g1, redirectUrl: h93eh29he, qrcodeUrl: akshdkadh(s3 File)}
  *   Get redirectUrl
  *   Dispatch hit count async sns -> sqs -> lambda
  *   Set redirect url in html redirect template
  * */
  const redirectUrl = 'https://www.example.com/';
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
  console.log(typeof qrcodeBuffer);
  const bucketParams = {
    Bucket: process.env.QRCODE_BUCKET_NAME,
    Key: `${id}.png`,
    Body: qrcodeBuffer
  }
  const command = new PutObjectCommand(bucketParams);
  const putObjectOutput = await s3.send(command);

  console.log(JSON.stringify(putObjectOutput));

  const oliveQRCode = {
    id, name, redirectUrl, qrCodeUrl: ''
  };
  // TODO: save qrcode metadata in dynamodb
  console.log(JSON.stringify(oliveQRCode));
  return {
    statusCode: 200
  };
}

module.exports = {handler, qrcodeHandler};
