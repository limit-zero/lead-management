const jwt = require('jsonwebtoken');

module.exports = (url) => {
  const match1 = /:\/\/leads\.ien\.com\/api\/c\/([a-f0-9]{24})/i.exec(url);
  if (match1 && match1[1]) return match1[1];

  const match2 = /:\/\/leads\.limit0\.io\/click\/([a-f0-9]{24})/i.exec(url);
  if (match2 && match2[1]) return match2[1];

  const match3 = /t=([a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+))/i.exec(url);
  if (match3 && match3[1]) {
    try {
      const { payload } = jwt.decode(match3[1], { complete: true, force: true }) || {};
      return payload.url || null;
    } catch (e) {
      return null;
    }
  }
  return null;
};
