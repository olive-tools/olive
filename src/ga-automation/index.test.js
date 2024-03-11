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
        DynamoDbAdapter: jest.fn().mockImplementation(() => {
            return {
                getByPK: jest.fn(async (tableName, partitionKey) => {
                    return Promise.resolve(resultsFromQuery)
                })
            }
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

const { DynamoDbAdapter } = require('../shared/dynamoDbAdapter');
const { insuranceScheduleHandler } = require('./index');

test("insuranceScheduleHandler should call DynamoDbAdapter getByPk", async () => {
    const dynamoDbMockInstance = new DynamoDbAdapter();
    insuranceScheduleHandler({}, dynamoDbMockInstance);
    expect(dynamoDbMockInstance.getByPK).toHaveBeenCalledTimes(1); 
});