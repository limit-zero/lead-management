const matchPattern = new RegExp('(<a[^>]+href=[\'"])(\\s{0,}http.*?)(["\'][^>]*>.*?</a>)', 'igs');

/**
 * Returns a raw, unique set of URLs found in the HTML.
 * By raw, we mean untrimmed, undecoded, and unnormalized.
 * It will _not_ discard invalid URLs or non http|https protocols.
 *
 * For example `<a href="  http://www.google.com?foo=bar&amp;x=y "></a>`
 * will be returned as `'  http://www.google.com?foo=bar&amp;x=y '`
 */
module.exports = async ({ html }) => {
  if (!html) return [];
  const hrefs = [];
  let match;
  do {
    match = matchPattern.exec(String(html));
    if (match) hrefs.push(match[2]);
  } while (match);
  return [...new Set(hrefs)];
};
