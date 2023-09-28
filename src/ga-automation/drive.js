const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const { Readable } = require('stream')
const TOKEN_PATH = path.join(__dirname, 'token.json');

async function saveInGoogleDrive(blob, fileName, mimeType = 'application/pdf') {
    const content = fs.readFileSync(TOKEN_PATH);
    const credentials = JSON.parse(content);
    const client = google.auth.fromJSON(credentials);

    const drive = google.drive({ version: 'v3', auth: client });

    return drive.files.create({
        requestBody: {
            name: fileName,
            parents: ['135ZUg58zTdgtS32JzhDou0MDP10iiEYd']
        },
        media: {
            mimeType,
            body: Readable.from(Buffer.from(blob))
        }
    });
}

module.exports = { saveInGoogleDrive };