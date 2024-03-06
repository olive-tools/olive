const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const { Readable } = require('stream')
const { config } = require('../config');

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
    const { installed } = config.googleDriveCredentials;
    const { client_secret, client_id, redirect_uris } = installed;
    const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(config.googleDriveToken);
    return oAuth2Client;
}

module.exports = { savePdf: saveInGoogleDrive };