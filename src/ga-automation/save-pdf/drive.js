const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const { Readable } = require('stream')

const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIAL_PATH = path.join(__dirname, 'credentials.json');
const DRIVE_BASE_FOLDER_ID = '135ZUg58zTdgtS32JzhDou0MDP10iiEYd';

async function saveInGoogleDrive(blob, fileName, mimeType = 'application/pdf') {
    const drive = google.drive({ version: 'v3', auth: getAuth() });

    return drive.files.create({
        requestBody: {
            name: fileName,
            parents: [DRIVE_BASE_FOLDER_ID]
        },
        media: {
            mimeType,
            body: Readable.from(Buffer.from(blob))
        }
    });
}

function getAuth() {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIAL_PATH));
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
}

module.exports = { savePdf: saveInGoogleDrive };