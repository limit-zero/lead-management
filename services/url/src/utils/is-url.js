const { isURL } = require('validator');

module.exports = url => isURL(url, {
  protocols: ['http', 'https'],
  require_protocol: true,
});
