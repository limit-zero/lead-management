const mongodb = require('@lead-management/mongodb');

const { MONGO_URI } = require('./env');

module.exports = mongodb({ uri: MONGO_URI });
