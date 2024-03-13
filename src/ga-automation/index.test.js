const resultsFromQuery = [{
    customer: {
        M: {
            name: {
                S: 'name1'
            },
            cpf: {
                S: 'cpf1'
            },
            birth: {
                S: 'birth1'
            }
        }
    },
    passenger: {
        M: {
            name: {
                S: 'name2'
            },
            cpf: {
                S: 'cpf2'
            },
            birth: {
                S: 'birth2'
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

    test("should update new insurance sheet columns", async () => {
        await insuranceScheduleHandler({}, new Date('2024-03-11T09:00:00.000Z'));
        expect(insertSheetRows).toHaveBeenCalledWith('COPYED_SHEET_ID', 'Plan1!B8:K9', [
            ['name1', 'cpf1', 'birth1', '2024-03-11', '2024-03-11', 30000, '', '', 1, 1],
            ['name2', 'cpf2', 'birth2', '2024-03-11', '2024-03-11', 30000, '', '', 1, 1]
        ]);
    });
});

