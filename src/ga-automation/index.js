const { isValidAuth } = require('../shared/auth');
const { buildGravataAventuraPDF } = require('./pdf');
const { saveInGoogleDrive } = require('./drive');
const { formMock } = require('./mock');
const { saveLocal } = require('./local');
const { convertBrDateToIso } = require('./utils');
const { SendMessageCommand, SQSClient } = require("@aws-sdk/client-sqs");

const client = new SQSClient({});

async function health(event) {
    console.log(JSON.stringify(event));
    return {
        statusCode: 200
    };
}

async function formSubmitHandler(event) {
    if (!isLocal() && !isValidAuth(event.headers.authorization)) {
        return {
            statusCode: 401,
        };
    }
    const raw = JSON.parse(event.body).event.values;
    console.log(raw);
    const formData = isLocal() ? formMock : parseData(raw);

    const command = new SendMessageCommand({
        QueueUrl: process.env.GA_FORM_SUBMITION_QUEUE_URL,
        MessageBody: JSON.stringify(formData),
    });

    const response = await client.send(command);
    console.log(response);

    return {
        statusCode: 201,
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(response.data)
    };
}

async function formSubmitMessageHandler(event) {
    const batchItemFailures = [];
    for (const record of event.Records) {
        try {
            const formSubmition = JSON.parse(record.body);
            console.log(formSubmition);
            const pdfBytes = await buildGravataAventuraPDF(formSubmition);
            const response = isLocal() ?
                saveLocal(pdfBytes) :
                await saveInGoogleDrive(pdfBytes, `${fileNameFromFormData(formSubmition)}.pdf`);
        } catch (e) {
            console.log(e);
        }
    }
}

function isLocal() {
    return process.env.ENVIRONMENT === "local";
}

function fileNameFromFormData(formData) {
    const nameArray = formData.customer.name.split(' ');
    const first = nameArray[0];
    let fileName = first;
    if (nameArray.length > 1) {
        const last = nameArray[nameArray.length - 1];
        fileName = `${first}-${last}`;
    }

    const tourDateString = convertBrDateToIso(formData.tourDate);
    return `${tourDateString}-${fileName}`.toLowerCase();
}

function parseData(formData) {
    if (isLocal()) {
        return formMock;
    }

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
        tour,
        ignoreThisParameter,
        tourDate
    ] = formData;

    const customer = {
        name: customerName.trim(),
        cpf: customerCpf.trim(),
        driverCode: customerDriverCode.trim(),
        birth: customerBirth.trim(),
        address: {
            street: customerAddress.trim(),
            city: customerCity.trim(),
            state: customerState.trim(),
        },
        phone: customerPhone.trim()
    }

    if (hasPassenger !== 'Sim') {
        return { customer, tour, tourDate };
    }

    let passenger = {
        name: passengerName.trim(),
        cpf: passengerCpf.trim(),
        driverCode: passengerDriverCode?.trim() ?? '',
        birth: passengerBirth.trim(),
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
    return { customer, passenger, tour, tourDate };
}

module.exports = { formSubmitHandler, health, formSubmitMessageHandler };
