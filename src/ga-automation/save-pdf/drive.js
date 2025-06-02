import { google } from 'googleapis';
import { Readable } from 'stream';
import { getAuth } from '../googledrive/auth';
import { config } from '../config';

export async function saveInGoogleDrive(blob, fileName, mimeType = 'application/pdf') {
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
