const fetch = require('node-fetch');
const BrightcoveOAuth = require('./oauth');

class BrightcoveFetch {
  constructor({ appId, secret } = {}) {
    this.oauth = new BrightcoveOAuth({ appId, secret });
    this.token = {
      value: undefined,
      expires: undefined,
    };
  }

  async json(url, options = {}) {
    const res = await this.request(url, options);
    return res.json();
  }

  async request(url, options = {}) {
    const token = await this.getToken();
    const headers = { ...options.headers, authorization: `Bearer ${token}` };
    return fetch(url, { ...options, headers });
  }

  async getToken() {
    // Attempt to load from cache.
    const token = this.getTokenFromCache();
    if (token) return token;

    // No token found (or expired). Load fresh.
    const { access_token: value, expires_in: ttl } = await this.oauth.getAccessToken();
    this.token.value = value;
    this.token.expires = new Date(Date.now() + ((ttl - 30) * 1000));
    return value;
  }

  getTokenFromCache() {
    const { expires, value } = this.token;
    if (!value) return null;
    if (!expires) return null;
    if (Date.now() < expires.valueOf()) return value;
    return null;
  }
}

module.exports = BrightcoveFetch;
