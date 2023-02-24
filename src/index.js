let QRCode = require('qrcode');
let uuid = require('uuid');
let isValidAuth = require('./auth').isValidAuth;

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
  if(!isValidAuth(event.headers.authorization)) {
    return {
      statusCode: 401
    };
  }
  const {name, redirectUrl} = JSON.parse(event.body);
  /* TODO:
  *   validate redirect url
  *   generate qrcode: await QRCode.toBuffer('qrcode.png', url);
  *   put generated code as object in s3
  *   save object link in qrCodeUrl property
  * */
  const oliveQRCode = {
    id: uuid.v4(), name, redirectUrl, qrCodeUrl: ''
  };
  return {
    statusCode: 200,
    headers: {
      "content-type": "text/html",
    },
    body: ''
  };
}

module.exports = {handler, qrcodeHandler};
