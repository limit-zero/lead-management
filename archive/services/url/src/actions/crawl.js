const { createError } = require('micro');
const cheerio = require('cheerio');
const { URL } = require('url');
const clean = require('./clean');
const request = require('../utils/request');
const { extractDescription, extractOpenGraph, extractTitle } = require('../utils/extractors');

module.exports = async ({ url }) => {
  if (!url) createError(400, "No 'url' was provided.");
  const { url: cleaned } = await clean({ url });
  const response = await request(cleaned, {
    jar: true,
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
    },
  });

  const $ = cheerio.load(response.body);
  const resolved = new URL(response.request.uri.href);

  return {
    urls: {
      original: url,
      cleaned,
      resolved: resolved.href,
      redirected: cleaned !== resolved.href,
    },
    resolvedHost: resolved.host,
    meta: {
      title: extractTitle($),
      description: extractDescription($),
      og: extractOpenGraph($),
    },
    time: response.timings.end,
  };
};
