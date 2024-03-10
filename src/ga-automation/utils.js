function convertBrDateToIso(dateString) {
    var parts = dateString.split('/');
    var day = parts[0];
    var month = parts[1];
    var year = parts[2];
    return `${year}-${month}-${day}`;
}

function currentBrIsoDate() {
    const brDateTime = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const brDate = brDateTime.split(',')[0];
    const brDateParts = brDate.split('/');
    return `${brDateParts[2]}-${brDateParts[1]}-${brDateParts[0]}`;
}
module.exports = { convertBrDateToIso, currentBrIsoDate };
