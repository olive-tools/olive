const { isValidAuth } = require('../auth');
const fs = require('fs');
const { buildGravataAventuraPDF } = require('./pdf');
const { parse } = require('path');

async function formSubmitHandler(event) {
    if (!isLocal() && !isValidAuth(event.headers.authorization)) {
        return {
            statusCode: 401,
        };
    }
    const row = JSON.parse(event.body).event.values;
    const pdfBytes = await buildGravataAventuraPDF(parseData(row));
    if (isLocal()) {
        fs.writeFileSync('local.pdf', pdfBytes);
    } else {
        //send pdf file somewhere else
    }

    return {
        statusCode: 200,
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(row)
    };
}

function isLocal() {
    return process.env.ENVIRONMENT === "local";
}

function parseData(formData) {
    if (isLocal()) {
        return {
            customer: {
                name: 'Fulano',
                cpf: '123.456.789-00',
                driverCode: '49823549508',
                birth: '10/10/1996',
                phone: '819999995555',
                address: {
                    street: 'Rua Coronel Urbano Ribeiro de Sena',
                    city: 'Recife',
                    state: 'PE',
                }
            },
            passenger: {
                name: 'Sicrano',
                cpf: '123.456.789-00',
                driverCode: '72438279437',
                birth: '24/07/1997',
                phone: '81999999999',
                address: {
                    street: 'Rua Monte Azul 38, apt 701',
                    city: 'Caruaru',
                    state: 'PE',
                }
            }
        };
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