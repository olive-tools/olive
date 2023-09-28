const formMock = {
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
module.exports = { formMock };
