const { createError } = require('micro');
const checkArray = require('./check-array');
const checkExists = require('./check-exists');
const checkObject = require('./check-object');
const checkRequired = require('./check-required');

module.exports = {
  checkArray,
  checkExists,
  checkObject,
  checkRequired,
  createError,
};
