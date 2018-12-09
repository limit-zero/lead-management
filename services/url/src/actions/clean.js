const { URL } = require('url');
const loadHref = require('../utils/load-href');
const getOriginal = require('../utils/get-original');
const handleInvalid = require('../utils/handle-invalid');

module.exports = async ({ url, onInvalid }) => {
  if (!url) return { url: '' };
  const v = String(url).trim();
  let href = loadHref(v);

  try {
    href = await getOriginal(href);
    if (!href) return handleInvalid(href, onInvalid);

    return { url: (new URL(href)).href };
  } catch (e) {
    if (!/^invalid url/i.test(e.message)) {
      throw e;
    }
    return handleInvalid(url, onInvalid);
  }
};
