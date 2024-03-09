const XLSX = require('xlsx');

const monthObjPtBr = {
    1: "JANEIRO",
    2: "FEVEREIRO",
    3: "MARÇO",
    4: "ABRIL",
    5: "MAIO",
    6: "JUNHO",
    7: "JULHO",
    8: "AGOSTO",
    9: "SETEMBRO",
    10: "OUTUBRO",
    11: "NOVEMBRO",
    12: "DEZEMBRO"
};

function fillInsuranceSheet(tourAtvs = [{ customer: { name: 'fulano', birth: 'fulanoNasc', cpf: 'fulanoCpf' }, passenger: { name: 'sicrano', birth: 'sicranoNasc', cpf: 'sicranoCpf' } }], tourDate = '2023-01-02', insuranceCode = 'code') {
    const workbook = XLSX.readFile(__dirname + '/insurance.xlsx');

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    worksheet['C2'] = { v: insuranceCode, t: "s" };
    const tourMonth = monthObjPtBr[parseInt(tourDate.split('-')[1])];
    worksheet['C4'] = { v: tourMonth, t: "s" };

    const customers = tourAtvs.flatMap((tourAtv) => {
        const { customer, passenger } = tourAtv;
        return [customer, passenger];
    });

    let currentLine = 8;
    for (let customer of customers) {
        worksheet[`B${currentLine}`] = { v: customer.name, t: "s" };
        worksheet[`C${currentLine}`] = { v: customer.cpf, t: "s" };
        worksheet[`D${currentLine}`] = { v: customer.birth, t: "s" };
        worksheet[`E${currentLine}`] = { v: tourDate, t: "s" };
        worksheet[`F${currentLine}`] = { v: tourDate, t: "s" };
        worksheet[`G${currentLine}`] = { v: 30000, t: "n" };
        worksheet[`J${currentLine}`] = { v: 1, t: "n" };
        worksheet[`K${currentLine}`] = { v: 1, t: "n" };
        currentLine++;
    }

    XLSX.writeFile(workbook, `${tourDate}-seguro.xlsx`, { bookType: 'xlsx', type: 'file' }, function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log("File edited successfully.");
        }
    });
}

module.exports = { fillInsuranceSheet };