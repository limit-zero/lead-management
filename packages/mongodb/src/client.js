const createClient = require('./create-client');
const { MONGO_URI } = require('./env');

module.exports = createClient({ uri: MONGO_URI });
