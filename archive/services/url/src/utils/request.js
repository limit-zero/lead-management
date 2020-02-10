const rp = require('request-promise');
const { getStatusText } = require('http-status-codes');
const { createError } = require('micro');

module.exports = async (uri, options) => {
  try {
    const response = await rp({
      uri,
      resolveWithFullResponse: true,
      time: true,
      ...options,
    });
    return response;
  } catch (e) {
    const { statusCode } = e;
    if (statusCode) {
      throw createError(statusCode, `${getStatusText(statusCode)}: ${uri}`);
    }
    throw e;
  }
};
