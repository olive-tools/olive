const { google } = require('googleapis');
const { getAuth } = require('./auth');

async function insertSheetRows(googleSheetId, range, rows) {
    try {
        const googleAuth = getAuth();
        const sheetInstance = await google.sheets({ version: 'v4', auth: googleAuth });

        // const explerows = [
        //     ['Seoul', '9,776,000', 'Asia', 'KRW'],
        //     ['Copenhagen', '602,000', 'Europe', 'EUR'],
        //     ['Amsterdam', '821,000', 'Europe', 'EUR'],
        //     ['Helsinki', '631,000', 'Europe', 'EUR'],
        //     ['Sydney', '5,312,000', 'Oceania', 'AUD']
        // ];

        // update data in the range
        await sheetInstance.spreadsheets.values.update({
            auth: googleAuth,
            spreadsheetId: googleSheetId,
            range, // example: `${googleSheetPage}!B8:E12`,
            valueInputOption: 'RAW',
            resource: {
                values: rows,
            },
        });
    }
    catch (err) {
        console.log("updateSheet func() error", err);
    }

}

module.exports = { insertRows };