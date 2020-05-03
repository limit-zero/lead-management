const { createError } = require('micro');

module.exports = (name, value, statusCode = 400) => {
  if (!value) throw createError(statusCode, `The ${name} field is required.`);
};
