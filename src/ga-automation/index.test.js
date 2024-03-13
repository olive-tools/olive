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
        getByPK: jest.fn(async (tableName, partitionKey) => Promise.resolve(resultsFromQuery))
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
jest.mock('./googledrive/copy-file', () => {
    return {
        copyFile: jest.fn(
            async (fileId, copyName, parents) => Promise.resolve({ id: 'COPYED_SHEET_ID' })
        )
    }
});

jest.mock('./googledrive/insert-sheet-rows', () => {
    return {
        insertSheetRows: jest.fn(
            async (googleSheetId, range, rows) => Promise.resolve()
        )
    }
});

const { copyFile } = require('./googledrive/copy-file');
const dynamoDbAdapter = require('../shared/dynamoDbAdapter');
const { insuranceScheduleHandler } = require('./index');
const { insertSheetRows } = require('./googledrive/insert-sheet-rows');

describe('insuranceScheduleHandler', () => {
    test("should call DynamoDbAdapter getByPk", async () => {
        await insuranceScheduleHandler({}, new Date('2024-03-11T09:00:00.000Z'));
        expect(dynamoDbAdapter.getByPK).toHaveBeenCalledWith('TOURS_TABLE', { tourDate: '2024-03-11' });
    });
    
    test("should create a copy of base insurance sheet", async () => {
        await insuranceScheduleHandler({}, new Date('2024-03-11T09:00:00.000Z'));
        expect(copyFile).toHaveBeenCalledWith('INSURANCE_FILE_ID', '2024-03-11-seguros');
    });
});

