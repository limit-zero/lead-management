const { MongoClient } = require('mongodb');

const { URL_MONGO_URI } = process.env;

module.exports = new MongoClient(URL_MONGO_URI, {
  useNewUrlParser: true,
  ignoreUndefined: true,
  bufferMaxEntries: 0,
});
