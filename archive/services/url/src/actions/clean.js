const { URL, URLSearchParams } = require('url');
const env = require('../env');
const loadHref = require('../utils/load-href');
const getOriginal = require('../utils/get-original');
const handleInvalid = require('../utils/handle-invalid');

const { URL_HASH_PARAM } = env;

/**
 * Cleans the provided URL.
 *
 * Will trim, parse and clean with cheerio and URL (removes html entities and url encoding).
 * Will convert previously tracked URLs to their original value.
 * Will remove the URL hash param if found.
 */
module.exports = async ({ url, onInvalid }, { mongodb }) => {
  if (!url) return { url: '' };
  const v = String(url).trim();
  let href = loadHref(v);

  try {
    href = await getOriginal(href, mongodb);
    if (!href) return handleInvalid(href, onInvalid);

    const cleaned = new URL(href);
    const params = new URLSearchParams(cleaned.search);
    if (params.has(URL_HASH_PARAM)) {
      params.delete(URL_HASH_PARAM);
      cleaned.search = params;
    }

    return { url: cleaned.href };
  } catch (e) {
    if (!/^invalid url/i.test(e.message)) {
      throw e;
    }
    return handleInvalid(url, onInvalid);
  }
};
