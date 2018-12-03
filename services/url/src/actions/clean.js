const cheerio = require('cheerio');
const { URL } = require('url');
const handleInvalid = require('../utils/handle-invalid');
const extractUrlId = require('../utils/extract-url-id');

module.exports = async ({ url, onInvalid }) => {
  if (!url) return { url: '' };
  const v = String(url).trim();
  const $ = cheerio.load(`<a href="${v}"></a>`);
  const href = $('a').attr('href');

  const urlId = extractUrlId(href);
  if (urlId) {
    // Must get the _resolved_ value from the DB.
    // What happens if not found... handleInvalid.
  }
  // console.log('URLID', urlId);

  try {
    return { url: (new URL(href)).href };
  } catch (e) {
    if (!/^invalid url/i.test(e.message)) {
      throw e;
    }
    return handleInvalid(url, onInvalid);
  }
};
