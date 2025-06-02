import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';

export function getAuth() {
    const { installed } = config.googleDriveCredentials;
    const { client_secret, client_id, redirect_uris } = installed;
    const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(config.googleDriveToken);
    return oAuth2Client;
}
