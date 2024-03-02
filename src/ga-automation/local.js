const fs = require('fs');

function saveLocal(blob) {
    // Specify the file path where you want to save the Blob content
    const filePath = __dirname + '/../../' + 'local.pdf';

    // Convert the Blob to a Buffer
    const buffer = Buffer.from(blob, 'binary');

    // Write the Buffer to a file
    fs.writeFileSync(filePath, buffer, 'binary');
    return {
        data: {}
    };
}

module.exports = { saveLocal };