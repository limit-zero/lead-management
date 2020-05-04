const { URLSearchParams } = require('url');
const BrightcoveFetch = require('../core/fetch');

const BASE_URI = 'https://analytics.api.brightcove.com/v1';

class BrightcoveAnalytics {
  constructor({ appId, secret, accountId }) {
    if (!accountId) throw new Error('The Brightcove accountId is required.');
    this.accountId = accountId;
    this.fetch = new BrightcoveFetch({ appId, secret });
  }

  async getData({
    dimensions = [],
    fields = [],
    where = [],
    from,
    to,
    limit = 10,
    offset = 0,
    sort,
  } = {}) {
    if (!dimensions.length) throw new Error('At least one dimension must be provided.');
    const endpoint = 'data';
    const params = new URLSearchParams({
      accounts: this.accountId,
      dimensions: dimensions.join(','),
      limit,
      offset,
      ...(sort && { sort }),
      ...(fields.length && { fields: fields.join(',') }),
      ...(where.length && { where: where.join(',') }),
      ...(from && { from }),
      ...(to && { to }),
    });
    const url = BrightcoveAnalytics.buildUrl({ endpoint, params });
    return this.fetch.json(url);
  }

  static buildUrl({ endpoint, params }) {
    const query = params ? `?${params}` : '';
    return `${BASE_URI}/${endpoint}${query}`;
  }
}

module.exports = BrightcoveAnalytics;
