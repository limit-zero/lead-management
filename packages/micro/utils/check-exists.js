const { createError } = require('micro');

module.exports = (type, field, value, result, statusCode = 404) => {
  if (!result) throw createError(statusCode, `No ${type} was found for ${field} '${value}'`);
};
