const { config } = require('../config');
const { v4 } = require('uuid');
const { buildGravataAventuraPDF } = require('../generate-pdf/pdf');

async function generatePdfAndSaveData(formSubmition) {
    try {
        const pdfBytes = await buildGravataAventuraPDF(formSubmition);
        const { savePdf } = require(config.savePdfFunctionPath);
        await savePdf(pdfBytes, `${fileNameFromFormData(formSubmition)}.pdf`);
    } catch (e) {
        console.error('SAVE PDF TO GOOGLE DRIVE ERROR', e);
    }
    try {
        const { persistTour } = require(config.persistTourFunctionPath);
        await persistTour({ ...formSubmition, id: v4() });
    } catch (e) {
        console.error('PERSISTENCE TO DYNAMODB ERROR', e)
    }
}

function fileNameFromFormData(formData) {
    const nameArray = formData.customer.name.split(' ');
    const first = nameArray[0];
    let fileName = first;
    if (nameArray.length > 1) {
        const last = nameArray[nameArray.length - 1];
        fileName = `${first}-${last}`;
    }
    return `${formData.tourDate}-${fileName}`.toLowerCase();
}


module.exports = {
    generatePdfAndSaveData,
};