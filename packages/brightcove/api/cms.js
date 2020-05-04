const { URLSearchParams } = require('url');
const BrightcoveFetch = require('../core/fetch');

const BASE_URI = 'https://cms.api.brightcove.com/v1';

class BrightcoveCMS {
  constructor({ appId, secret, accountId }) {
    if (!accountId) throw new Error('The Brightcove accountId is required.');
    this.accountId = accountId;
    this.fetch = new BrightcoveFetch({ appId, secret });
  }

  async getVideos({
    limit = 20,
    offset = 0,
    sort = 'created_at',
    q,
  } = {}) {
    const endpoint = `accounts/${this.accountId}/videos`;
    const params = new URLSearchParams({ limit, offset, sort });
    if (q) params.set('q', q);
    const url = BrightcoveCMS.buildUrl({ endpoint, params });
    return this.fetch.json(url);
  }

  async getVideoCount({
    sort = 'created_at',
    q,
  } = {}) {
    const endpoint = `accounts/${this.accountId}/counts/videos`;
    const params = new URLSearchParams({ sort });
    if (q) params.set('q', q);
    const url = BrightcoveCMS.buildUrl({ endpoint, params });
    return this.fetch.json(url);
  }

  static buildUrl({ endpoint, params }) {
    const query = params ? `?${params}` : '';
    return `${BASE_URI}/${endpoint}${query}`;
  }
}

module.exports = BrightcoveCMS;
