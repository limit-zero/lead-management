const extractFromHtml = require('./extract-from-html');
const clean = require('./clean');

/**
 * Creates an array map of raw-to-clean URLs.
 * By clean, we mean trimmed, decoded, and normalized via URL parsing.
 *
 * For example, if an incoming array value is
 * '  http://www.google.com?foo=bar&amp;x=y '
 * it will be mapped as:
 * {
 *  raw: '  http://www.google.com?foo=bar&amp;x=y ',
 *  cleaned: 'http://www.google.com?foo=bar&x=y',
 * }
 *
 */
module.exports = async ({ html }) => {
  const hrefs = await extractFromHtml({ html });
  const mapped = await Promise.all(hrefs.map(async (url) => {
    const { url: cleaned } = await clean({ url });
    return { raw: url, cleaned };
  }));
  return mapped;
};
