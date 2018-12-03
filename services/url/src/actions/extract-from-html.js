const { isURL } = require('validator');

const matchPattern = new RegExp('(<a[^>]+href=[\'"])(\\s{0,}http.*?)(["\'][^>]*>.*?</a>)', 'igs');

/**
 * Returns a raw, unique set of URLs found in the HTML.
 * By raw, we mean untrimmed, undecoded, and unnormalized.
 * It will discard outright invalid URLs that do not start
 * with http|https, are empty, or are bad, such as https://
 *
 * For example `<a href="  http://www.google.com?foo=bar&amp;x=y "></a>`
 * will be returned as `'  http://www.google.com?foo=bar&amp;x=y '`
 */
module.exports = async ({ html }) => {
  const hrefs = [];
  let match;
  do {
    match = matchPattern.exec(html);
    if (match) {
      // The URL validator will fail if any spaces, <, or > characters are found.
      // As such, temporarily replace these with url encoded items.
      const temp = match[2]
        .trim()
        .replace(/\s/g, '%20')
        .replace(/</g, '%3C')
        .replace(/</g, '%3E');
      if (isURL(temp, { protocols: ['http', 'https'], require_protocol: true })) {
        hrefs.push(match[2]);
      }
    }
  } while (match);
  return [...new Set(hrefs)];
};
