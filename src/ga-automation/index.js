const { isValidAuth } = require('../shared/auth');
const { currentBrIsoDate } = require('./utils');
const { SendMessageCommand, SQSClient } = require("@aws-sdk/client-sqs");
const { config } = require('./config');
const { v4 } = require('uuid');
const { DynamoDbAdapter } = require('../shared/dynamoDbAdapter');
const { insertSheetRows } = require('./googledrive/insert-sheet-rows');
const { copyFile } = require('./googledrive/copy-file');
const { retrieveTourAtvs } = require('./use-cases/retrieve-tour-atvs');
const { generatePdfAndSaveData } = require('./use-cases/atv-tour-pdf-and-save');
const { mapSheetsArrayToTour, mapBuggyFormArrayToTour } = require('./mappers/mappers');

const client = new SQSClient(config.sqsConfig);

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
        await generatePdfAndSaveData(formSubmition);
    }
}

async function insuranceScheduleHandler(event) {
    const tourDate = currentBrIsoDate();
    let tourAtvs;
    try {
        const dynamoDbAdapter = new DynamoDbAdapter();
        tourAtvs = await dynamoDbAdapter.getByPKAsJson(config.toursTableName, { tourDate });
    } catch (e) {
        console.error('ERROR TRYING TO RETRIEVE TOUR ATVS', e);
        return;
    }
    if (!tourAtvs || tourAtvs.length === 0) {
        return;
    }

    const personRows = tourAtvs.flatMap(tourAtv => {
        const { customer, passenger, passengers } = tourAtv;
        if (passengers && passengers.length > 0) {
            return passengers.map(p => {
                const buggyPassenger = {
                    name: p.fullName,
                    cpf: p.cpf,
                    birth: p.birthday,
                };
                return buggyPassenger;
            });
        }

        const atvDriver = {
            name: customer.name,
            cpf: customer.cpf,
            birth: customer.birth,
        };

        if (!passenger) {
            return [atvDriver];
        }

        const atvPassenger = {
            name: passenger.name,
            cpf: passenger.cpf,
            birth: passenger.birth,
        };

        return [atvDriver, atvPassenger];
    }).map(person => {
        return [person.name, person.cpf, person.birth, tourDate, tourDate, 30000, '', '', 1, 1];
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
    const dateRequiredResponse = {
        statusCode: 400,
        body: JSON.stringify({ error: 'Date parameter is required' }),
    };
    if (!event.queryStringParameters) {
        return dateRequiredResponse;
    }
    const date = event.queryStringParameters.date;
    if (!date) {
        return dateRequiredResponse;
    }

    const result = await retrieveTourAtvs(date);
    return {
        statusCode: 200,
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(result)
    };
}

async function buggyFormSubmitHandler(event) {
    if (!isValidAuth(event.headers.authorization)) {
        return {
            statusCode: 401,
        };
    }
    const raw = JSON.parse(event.body).event.values;
    console.log('Raw buggy form data:', raw);

    const buggyTourData = mapBuggyFormArrayToTour(raw);
    console.log('Processed buggy tour data:', buggyTourData);

    try {
        const dynamoDbAdapter = new DynamoDbAdapter();
        const tourRecord = { ...buggyTourData, id: v4() };

        await dynamoDbAdapter.putItemFromObjet(config.toursTableName, tourRecord);

        return {
            statusCode: 200,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                message: "Buggy tour data saved successfully",
                tourId: tourRecord.id,
                tourDate: tourRecord.tourDate,
            })
        };
    } catch (error) {
        console.error('Error saving buggy tour data:', error);
        return {
            statusCode: 500,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                error: "Failed to save tour data"
            })
        };
    }
}

module.exports = {
    formSubmitHandler,
    formSubmitMessageHandler,
    insuranceScheduleHandler,
    getTourAtvsHandler,
    buggyFormSubmitHandler,
};
