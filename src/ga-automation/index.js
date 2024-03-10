const { isValidAuth } = require('../shared/auth');
const { buildGravataAventuraPDF } = require('./pdf');
const { convertBrDateToIso, currentBrIsoDate } = require('./utils');
const { SendMessageCommand, SQSClient } = require("@aws-sdk/client-sqs"); // todo: create adapter
const { config } = require('./config');
const { v4 } = require('uuid');
const { DynamoDbAdapter } = require('../shared/dynamoDbAdapter');
const { insertSheetRows } = require('./googledrive/insert-sheet-rows');
const { copyFile } = require('./googledrive/copy-file');
const client = new SQSClient(config.sqsConfig);

async function health(event) {
    console.log(JSON.stringify(event));
    return {
        statusCode: 200
    };
}

async function formSubmitHandler(event) {
    console.log(JSON.stringify(config));
    if (!isValidAuth(event.headers.authorization)) {
        return {
            statusCode: 401,
        };
    }
    const raw = JSON.parse(event.body).event.values;
    console.log(raw);
    const formData = parseData(raw);
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

function parseData(formData) {
    const [
        submitedAt,
        customerName,
        customerBirth,
        customerDriverCode,
        customerCpf,
        customerAddress,
        customerCity,
        customerState,
        customerPhone,
        hasPassenger,
        passengerName,
        passengerBirth,
        passengerDriverCode,
        passengerCpf,
        addressType,
        passengerAddress,
        passengerCity,
        passengerState,
        passengerCep,
        customerCep,
        passengerPhone,
        tourName,
        ignoreThisParameter,
        tourDate
    ] = formData;

    const customer = {
        name: customerName.trim(),
        cpf: customerCpf.trim(),
        driverCode: customerDriverCode.trim(),
        birth: convertBrDateToIso(customerBirth.trim()),
        address: {
            street: customerAddress.trim(),
            city: customerCity.trim(),
            state: customerState.trim(),
        },
        phone: customerPhone.trim()
    }

    if (hasPassenger !== 'Sim') {
        return { customer, tourName, tourDate: convertBrDateToIso(tourDate) };
    }

    let passenger = {
        name: passengerName.trim(),
        cpf: passengerCpf.trim(),
        driverCode: passengerDriverCode?.trim() ?? '',
        birth: convertBrDateToIso(passengerBirth.trim()),
        phone: passengerPhone.trim()
    }

    const sameAddress = addressType !== 'Outro';

    if (sameAddress) {
        passenger = { ...passenger, address: customer.address };
    } else {
        passenger = {
            ...passenger, address: {
                street: passengerAddress,
                city: passengerCity,
                state: passengerState,
            },
        };
    }
    return { customer, passenger, tourName, tourDate: convertBrDateToIso(tourDate) };
}

async function insuranceScheduleHandler(event) {
    let tourAtvs;
    try {
        const dynamoDbAdapter = new DynamoDbAdapter();
        const tourDate = currentBrIsoDate();
        tourAtvs = await dynamoDbAdapter.getByPK(config.toursTableName, { tourDate });
    } catch (e) {
        console.error('ERROR TRYING TO RETRIEVE TOUR ATVS', e);
        return;
    }
    const personRows = tourAtvs.flatMap(tourAtv => {
        const { customer, passenger } = tourAtv;
        return [customer, passenger]
    }).map(person => {
        return [person.name.S, person.cpf.S, person.birth.S, tourDate, tourDate, 30000, '', '', 1, 1];
    });
    if (personList.length == 0) {
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
        const range = `Plan1!B8:K${7 + personRows.length}`;
        await insertSheetRows(copyFileMetadata.id, range, personRows);
    } catch (e) {
        console.error('ERROR INSERTING SHEET ROWS', e);
    }
}

module.exports = { formSubmitHandler, health, formSubmitMessageHandler, insuranceScheduleHandler };
