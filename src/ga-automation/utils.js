function convertBrDateToIso(dateString) {
    var parts = dateString.split('/');
    var day = parts[0];
    var month = parts[1];
    var year = parts[2];
    return `${year}-${month}-${day}`;
}

module.exports = { convertBrDateToIso };
