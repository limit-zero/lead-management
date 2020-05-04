const { OAuth2 } = require('oauth');

class BrightcoveOAuth {
  constructor({ appId, secret } = {}) {
    if (!appId || !secret) throw new Error('The Brightcove API appId and secret are required.');
    this.appId = appId;
    this.secret = secret;

    this.instance = new OAuth2(appId, secret, 'https://oauth.brightcove.com/', null, 'v4/access_token');
  }

  getAccessToken() {
    return new Promise((resolve, reject) => {
      this.instance.getOAuthAccessToken('', { grant_type: 'client_credentials' }, (e, accessToken, refreshToken, results) => {
        if (e) {
          reject(e);
        } else {
          resolve(results);
        }
      });
    });
  }
}

module.exports = BrightcoveOAuth;
