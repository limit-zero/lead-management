const retrieve = require('./retrieve');
const retrieveForSend = require('./retrieve-for-send');

module.exports = {
  retrieve,
  'retrieve-for-send': retrieveForSend,
};
