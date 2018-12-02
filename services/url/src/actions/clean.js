const cheerio = require('cheerio');
const { URL } = require('url');

module.exports = async ({ url, onInvalid }) => {
  if (!url) return { url: '' };
  const v = String(url).trim();
  const $ = cheerio.load(`<a href="${v}"></a>`);
  const href = $('a').attr('href');

  try {
    return { url: (new URL(href)).href };
  } catch (e) {
    if (!/^invalid url/i.test(e.message)) {
      throw e;
    }
    switch (onInvalid) {
      case 'return':
        return { url: href };
      case 'empty':
        return { url: '' };
      default:
        throw e;
    }
  }
};
