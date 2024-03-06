const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');

const tokenPath = __dirname + '/../src/ga-automation/token.json';
const credentialsPath = __dirname + '/../src/ga-automation/credentials.json';

// Load client secrets from a file
fs.readFile(credentialsPath, (err, content) => {
  if (err) {
    console.error('Error loading client secret file:', err);
    return;
  }

  // Authorize a client with credentials
  authorize(JSON.parse(content), listFiles);
});

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(tokenPath, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getAccessToken(oAuth2Client, callback) {
  console.log('generating new googleapis token');
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive'],
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(tokenPath, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', tokenPath);
      });
      callback(oAuth2Client);
    });
  });
}

function listFiles(auth) {
  const drive = google.drive({ version: 'v3', auth });
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.error('The API returned an error:', err.message);

    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.forEach((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  });
}
