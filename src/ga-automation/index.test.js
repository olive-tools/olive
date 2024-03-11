const resultsFromQuery = [{
    customer: {
        M: {
            name: {
                S: ''
            },
            cpf: {
                S: ''
            },
            birth: {
                S: ''
            }
        }
    },
    passenger: {
        M: {
            name: {
                S: ''
            },
            cpf: {
                S: ''
            },
            birth: {
                S: ''
            }
        }
    }
}];
jest.mock('../shared/dynamoDbAdapter', () => {
    return {
        getByPK: jest.fn(async (tableName, partitionKey) => {
            return Promise.resolve(resultsFromQuery)
        })

    }
});
jest.mock('./config', () => {
    return {
        config: {
            toursTableName: 'TOURS_TABLE',
            googleDriveBaseInsuranceFile: 'INSURANCE_FILE_ID'
        }
    }
});

const dynamoDbAdapter = require('../shared/dynamoDbAdapter');
const { insuranceScheduleHandler } = require('./index');

test("insuranceScheduleHandler should call DynamoDbAdapter getByPk", async () => {
    insuranceScheduleHandler({}, new Date(2024, 2, 11));
    expect(dynamoDbAdapter.getByPK).toHaveBeenCalledWith('TOURS_TABLE', { tourDate: '2024-03-11' });
});