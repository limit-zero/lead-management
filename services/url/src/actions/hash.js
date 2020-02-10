const { createHash } = require('crypto');

module.exports = async ({ url }) => {
  const hash = createHash('md5').update(url ? `${url}` : '').digest('hex');
  return { hash };
};
