const mongodb = require('mongodb');

const defaultOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

module.exports = ({ uri, options } = {}) => {
  const { MongoClient } = mongodb;

  let promise;

  const connect = () => {
    if (!promise) {
      promise = MongoClient.connect(uri, {
        ...defaultOptions,
        ...options,
      });
    }
    return promise;
  };

  const database = async (dbName, opts) => {
    const client = await connect();
    return client.db(dbName, opts);
  };

  const collection = async (dbName, collName, opts) => {
    const db = await database(dbName);
    return db.collection(collName, opts);
  };

  return {
    uri,
    connect,
    database,
    collection,
    mongodb,
  };
};
