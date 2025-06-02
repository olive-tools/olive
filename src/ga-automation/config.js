function getConfig() {
    return {
        sqsUrl: isLocal() ? "http://localhost:9324/000000000000/ga-form-submition" : process.env.GA_FORM_SUBMITION_QUEUE_URL,
        sqsConfig: isLocal() ? { endpoint: "http://localhost:9324", region: "us-east-1" } : {},
        savePdfFunctionPath: isLocal() ? __dirname + '/save-pdf/local.js' : __dirname + '/save-pdf/drive.js',
        toursTableName: process.env.GA_TOURS_TABLE_NAME,
        persistTourFunctionPath: isLocal() ? __dirname + '/persist-tour/local.js' : __dirname + '/persist-tour/dynamodb.js',
        googleDriveCredentials: JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS),
        googleDriveToken: JSON.parse(process.env.GOOGLE_DRIVE_TOKEN),
        googleDriveBaseInsuranceFile: process.env.GOOGLE_DRIVE_BASE_INSURANCE_FILE,
        googleDriveParentTermFolder: process.env.GOOGLE_DRIVE_PARENT_PDF_FOLDER,
        googleDriveParentInsuranceFolder: process.env.GOOGLE_DRIVE_PARENT_INSURANCE_FOLDER,
        oliveToolsUrl: "https://olive.tools/api",
        oliveToolsSecret: process.env.OLIVE_TOOLS_SECRET,
    }
}

function isLocal() {
    return process.env.ENVIRONMENT === "local";
}

const config = getConfig();
export { config };