const { OAuth2Client } = require('google-auth-library');
const { config } = require('../config');

function getAuth() {
    const { installed } = config.googleDriveCredentials;
    const { client_secret, client_id, redirect_uris } = installed;
    const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(config.googleDriveToken);
    return oAuth2Client;
}


module.exports = { getAuth };