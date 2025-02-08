const { isValidAuth } = require('../shared/auth');
const { buildGravataAventuraPDF } = require('./pdf');
const { currentBrIsoDate } = require('./utils');
const { SendMessageCommand, SQSClient } = require("@aws-sdk/client-sqs"); // todo: create adapter
const { config } = require('./config');
const { v4 } = require('uuid');
const { DynamoDbAdapter } = require('../shared/dynamoDbAdapter');
const { insertSheetRows } = require('./googledrive/insert-sheet-rows');
const { copyFile } = require('./googledrive/copy-file');
const { retrieveTourAtvs } = require('./use-cases/retrieve-tour-atvs');
const client = new SQSClient(config.sqsConfig);
const { mapSheetsArrayToTour } = require('./mappers/mappers');
const axios = require('axios');

async function formSubmitHandler(event) {
    if (!isValidAuth(event.headers.authorization)) {
        return {
            statusCode: 401,
        };
    }
    const raw = JSON.parse(event.body).event.values;
    console.log(raw);
    const formData = mapSheetsArrayToTour(raw);
    const command = new SendMessageCommand({
        QueueUrl: config.sqsUrl,
        MessageBody: JSON.stringify(formData),
    });

    await client.send(command);

    return {
        statusCode: 201,
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(formData)
    };
}

async function formSubmitMessageHandler(event) {
    for (const record of event.Records) {
        const formSubmition = JSON.parse(record.body);
        console.log(formSubmition);
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
        try {
            const auth = Buffer.from(`admin:${config.oliveToolsSecret}`).toString('base64');
            axios.post(`${config.oliveToolUrl}/service-requests`, formSubmition, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
                timeout: 5000,
            });
        } catch (e) {
            console.error('OLIVE TOOL CALL ERROR', e);
        }

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

async function insuranceScheduleHandler(event) {
    const tourDate = currentBrIsoDate();
    let tourAtvs;
    try {
        const dynamoDbAdapter = new DynamoDbAdapter();
        tourAtvs = await dynamoDbAdapter.getByPK(config.toursTableName, { tourDate });
    } catch (e) {
        console.error('ERROR TRYING TO RETRIEVE TOUR ATVS', e);
        return;
    }
    if (!tourAtvs) {
        return;
    }
    const personRows = tourAtvs.flatMap(tourAtv => {
        const { customer, passenger } = tourAtv;
        if (!passenger)
            return [customer.M];
        return [customer.M, passenger.M]
    }).map(person => {
        return [person.name.S, person.cpf.S, person.birth.S, tourDate, tourDate, 30000, '', '', 1, 1];
    });
    if (personRows.length == 0) {
        return;
    }
    let copyFileMetadata;
    try {
        copyFileMetadata = await copyFile(config.googleDriveBaseInsuranceFile, `${tourDate}-seguros`);
    } catch (e) {
        console.error('ERROR COPYING GOOGLE DRIVE FILE', e);
        return;
    }
    try {
        const HEADER_LENGTH = 7;
        const range = `Plan1!B8:K${HEADER_LENGTH + personRows.length}`;
        await insertSheetRows(copyFileMetadata.id, range, personRows);
    } catch (e) {
        console.error('ERROR INSERTING SHEET ROWS', e);
    }
}

async function getTourAtvsHandler(event) {
    if (!isValidAuth(event.headers.authorization)) {
        return {
            statusCode: 401,
        };
    }
    const date = event.queryStringParameters.date;
    const result = await retrieveTourAtvs(date);
    return {
        statusCode: 200,
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(result)
    };
}

module.exports = {
    formSubmitHandler,
    formSubmitMessageHandler,
    insuranceScheduleHandler,
    getTourAtvsHandler,
};
