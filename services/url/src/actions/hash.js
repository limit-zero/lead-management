const { createHash } = require('crypto');
const { checkRequired } = require('@lead-management/micro/utils');

module.exports = async ({ url } = {}) => {
  checkRequired('url', url);
  const hash = createHash('md5').update(url ? `${url}` : '').digest('hex');
  return { hash };
};
