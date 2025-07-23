const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const FONT_SIZE = 9;
const START_WIDTH = 85;
const FONT_COLOR = rgb(0.95, 0.1, 0.1);

async function buildGravataAventuraPDF(input) {
    const pdfDoc = await PDFDocument.load(fs.readFileSync(path.join(__dirname, 'gravata.pdf')));
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();
    const { customer, passenger } = input;
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const START_HEIGHT =  height / 2 + 265;
    await drawCustomer(customer, firstPage, helveticaFont, START_HEIGHT, START_WIDTH);
    if(input.passenger) {
        await drawCustomer(passenger, firstPage, helveticaFont, START_HEIGHT - 68, START_WIDTH);
    }
    return pdfDoc.save()
}

async function drawCustomer(customer, firstPage, helveticaFont, startHight, startWidth) {
    const { name, cpf, driverCode, birth, address, phone } = customer;
    const {city, state, street} = address;

    firstPage.drawText(name, {
        x: startWidth + 30,
        y: startHight,
        size: FONT_SIZE,
        font: helveticaFont,
        color: FONT_COLOR,
    });

    firstPage.drawText(birth, {
        x: startWidth + 290,
        y: startHight,
        size: FONT_SIZE,
        font: helveticaFont,
        color: FONT_COLOR,
    });

    let currentHeight = startHight - 14;

    firstPage.drawText(driverCode, {
        x: startWidth,
        y: currentHeight,
        size: FONT_SIZE,
        font: helveticaFont,
        color: FONT_COLOR,
    });

    firstPage.drawText(cpf, {
        x: startWidth + 100,
        y: currentHeight,
        size: FONT_SIZE,
        font: helveticaFont,
        color: FONT_COLOR,
    });

    firstPage.drawText(street, {
        x: startWidth + 230,
        y: currentHeight,
        size: FONT_SIZE,
        font: helveticaFont,
        color: FONT_COLOR,
    });

    currentHeight = currentHeight - 12;

    firstPage.drawText(city, {
        x: startWidth + 32,
        y: currentHeight,
        size: FONT_SIZE,
        font: helveticaFont,
        color: FONT_COLOR,
    });

    firstPage.drawText(state, {
        x: startWidth + 152,
        y: currentHeight,
        size: FONT_SIZE,
        font: helveticaFont,
        color: FONT_COLOR,
    });

    firstPage.drawText(phone, {
        x: startWidth + 218,
        y: currentHeight,
        size: FONT_SIZE,
        font: helveticaFont,
        color: FONT_COLOR,
    });
}

module.exports = { buildGravataAventuraPDF };