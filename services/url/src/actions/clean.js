const cheerio = require('cheerio');
const { URL } = require('url');
const isURL = require('../utils/is-url');
const handleInvalid = require('../utils/handle-invalid');

module.exports = async ({ url, onInvalid }) => {
  if (!url) return { url: '' };
  const v = String(url).trim();
  const $ = cheerio.load(`<a href="${v}"></a>`);
  const href = $('a').attr('href');

  if (!isURL(href)) return handleInvalid(url, onInvalid);
  try {
    return { url: (new URL(href)).href };
  } catch (e) {
    if (!/^invalid url/i.test(e.message)) {
      throw e;
    }
    return handleInvalid(url, onInvalid);
  }
};
