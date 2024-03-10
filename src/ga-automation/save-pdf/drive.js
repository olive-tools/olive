const { google } = require('googleapis');
const { Readable } = require('stream')
const { getAuth } = require('../googledrive/auth');
const { config } = require('../config');

async function saveInGoogleDrive(blob, fileName, mimeType = 'application/pdf') {
    const drive = google.drive({ version: 'v3', auth: getAuth() });

    return drive.files.create({
        requestBody: {
            name: fileName,
            parents: [config.googleDriveParentTermFolder]
        },
        media: {
            mimeType,
            body: Readable.from(Buffer.from(blob))
        }
    });
}

module.exports = { savePdf: saveInGoogleDrive };