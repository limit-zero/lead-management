const { createError } = require('micro');
const checkRequired = require('./check-required');

const { isArray } = Array;

module.exports = (name, value, statusCode = 400) => {
  checkRequired(name, value, statusCode);
  if (!isArray(value)) throw createError(statusCode, `The ${name} field must be an array.`);
};
