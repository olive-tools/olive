function convertBrDateToIso(dateString) {
    var parts = dateString.split('/');
    // Note: months are 0-based in JavaScript Date object, so we need to subtract 1
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);

    // Check if the input is valid
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
        return null; // Invalid date
    }

    return `${year}-${month}-${day}`;
}

module.exports = { convertBrDateToIso };
