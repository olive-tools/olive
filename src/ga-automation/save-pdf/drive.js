const { google } = require('googleapis');
const { Readable } = require('stream')
const { getAuth } = require('../googledrive/auth');

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

module.exports = { savePdf: saveInGoogleDrive };