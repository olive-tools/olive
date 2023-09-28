const { isValidAuth } = require('../auth');
const { buildGravataAventuraPDF } = require('./pdf');
const { saveInGoogleDrive } = require('./drive');
const { formMock } = require('./mock');

async function formSubmitHandler(event) {
    if (!isLocal() && !isValidAuth(event.headers.authorization)) {
        return {
            statusCode: 401,
        };
    }
    const raw = JSON.parse(event.body).event.values;
    const formData = parseData(raw);
    const pdfBytes = await buildGravataAventuraPDF(formData);
    await saveInGoogleDrive(pdfBytes, `${fileNameFromFormData(formData)}.pdf`);

    return {
        statusCode: 200,
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(raw)
    };
}

function isLocal() {
    return process.env.ENVIRONMENT === "local";
}

function fileNameFromFormData(formData) {
    const nameArray = formData.customer.name.split(' ');
    const first = nameArray[0];
    let fileName = first;
    if(nameArray > 1) {
        const last = nameArray[nameArray.length - 1];
        fileName = `${first}-${last}`;
    }
    const now = new Date().toJSON().slice(0, 10);
    return `${now}-${fileName}`.toLowerCase();
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
        customerCep] = formData;

    const customer = {
        name: customerName,
        cpf: customerCpf,
        driverCode: customerDriverCode,
        birth: customerBirth,
        address: {
            street: customerAddress,
            city: customerCity,
            state: customerState,
        },
        phone: customerPhone
    }
    hasPassenger = hasPassenger === 'Sim';
    if (!hasPassenger) {
        return { customer };
    }

    let passenger = {
        name: passengerName,
        cpf: passengerCpf,
        driverCode: passengerDriverCode,
        birth: passengerBirth
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
    return { customer, passenger };
}

module.exports = { formSubmitHandler };