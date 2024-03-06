const { isValidAuth } = require('../shared/auth');
const { buildGravataAventuraPDF } = require('./pdf');
const { convertBrDateToIso } = require('./utils');
const { SendMessageCommand, SQSClient } = require("@aws-sdk/client-sqs"); // todo: create adapter
const { getConfig } = require('./config');
const config = getConfig();
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
        try {
            const formSubmition = JSON.parse(record.body);
            console.log(formSubmition);
            const pdfBytes = await buildGravataAventuraPDF(formSubmition);
            const { savePdf } = require(config.savePdfFunctionPath);
            await savePdf(pdfBytes, `${fileNameFromFormData(formSubmition)}.pdf`);
        } catch (e) {
            console.log(e);
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

    const tourDateString = convertBrDateToIso(formData.tourDate);
    return `${tourDateString}-${fileName}`.toLowerCase();
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
