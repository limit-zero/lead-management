const { createHash } = require('crypto');
const { createRequiredParamError } = require('@base-cms/micro').service;

module.exports = async ({ url } = {}) => {
  if (!url) throw createRequiredParamError('url');
  const hash = createHash('md5').update(url ? `${url}` : '').digest('hex');
  return { hash };
};
