import { google } from 'googleapis';
import { getAuth } from './auth';

export async function copyFile(fileId, copyName, parents) {
    const drive = google.drive({ version: 'v3', auth: getAuth() });
    const res = await drive.files.copy({
        fileId: fileId,
        requestBody: {
            name: copyName,
            parents
        }
    });
    return res.data; // kind, id, name, mimeType
}
