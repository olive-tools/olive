import { writeFileSync } from 'fs';

function savePdfLocally(blob, filename, mimeType = 'application/pdf') {
    // Specify the file path where you want to save the Blob content
    const filePath = __dirname + '/../../' + filename;

    // Convert the Blob to a Buffer
    const buffer = Buffer.from(blob, 'binary');

    // Write the Buffer to a file
    writeFileSync(filePath, buffer, 'binary');
    return {
        data: {}
    };
}

export const savePdf = savePdfLocally;