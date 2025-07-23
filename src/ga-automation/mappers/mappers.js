const { convertBrDateToIso } = require('../utils');

function mapSheetsArrayToTour(formData) {
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

function mapBuggyFormArrayToTour(raw) {
    const tour = {
        timestamp: raw[0],
        marketingSource: raw[1],
        hotelOrBusiness: raw[2],
        tourRoute: raw[3],
        tourDate: raw[4],
        passengers: []
    };

    let currentIndex = 5;
    
    // Process up to 4 passengers
    for (let passengerNum = 0; passengerNum < 4 && currentIndex < raw.length; passengerNum++) {
        // Check if we have enough data for a passenger (name, birthday, cpf, phone)
        if (currentIndex + 3 >= raw.length) break;
        
        const passenger = {
            fullName: raw[currentIndex],
            birthday: raw[currentIndex + 1],
            cpf: raw[currentIndex + 2],
            phoneNumber: raw[currentIndex + 3]
        };
        
        tour.passengers.push(passenger);
        currentIndex += 4;
        
        // Check if there's another passenger
        if (currentIndex < raw.length) {
            const hasNextPassenger = raw[currentIndex];
            currentIndex += 1;
            
            // If "Não" or we've reached the end, stop processing
            if (hasNextPassenger === 'Não' || currentIndex >= raw.length) {
                break;
            }
        }
    }
    
    return tour;
}

module.exports = { mapSheetsArrayToTour, mapBuggyFormArrayToTour };
