const { createError } = require('micro');
const { isObject } = require('@lead-management/utils');
const checkRequired = require('./check-required');

module.exports = (name, value, statusCode = 400) => {
  checkRequired(name, value, statusCode);
  if (!isObject(value)) throw createError(statusCode, `The ${name} field must be an object.`);
};
