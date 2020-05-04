const { URLSearchParams } = require('url');
const BrightcoveFetch = require('../core/fetch');

const BASE_URI = 'https://analytics.api.brightcove.com/v1';

const { isArray } = Array;

class BrightcoveAnalytics {
  constructor({ appId, secret, accountId }) {
    if (!accountId) throw new Error('The Brightcove accountId is required.');
    this.accountId = accountId;
    this.fetch = new BrightcoveFetch({ appId, secret });
  }

  async getVideoData({
    videoId,
    fields,
    from,
    to,
    reconciled,
  } = {}) {
    const dimensions = ['video'];
    const where = [`video==${videoId}`];
    const defaultFields = [
      'video_duration',
      'video_impression',
      'video_seconds_viewed',
      'video_view',
      'video_engagement_25',
      'video_engagement_50',
      'video_engagement_75',
      'video_engagement_100',
    ];

    return this.getData({
      dimensions,
      where,
      fields: isArray(fields) && fields.length ? fields : defaultFields,
      from,
      to,
      reconciled,
    });
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
    reconciled,
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
      ...(where.length && { where: where.join(';') }),
      ...(from && { from }),
      ...(to && { to }),
      ...([true, false].includes(reconciled) && { reconciled: `${reconciled}` }),
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
