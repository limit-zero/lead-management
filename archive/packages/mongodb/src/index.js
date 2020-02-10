const mongodb = require('mongodb');

const { MongoClient } = mongodb;
const { MONGO_URI } = require('./env');

let promise;

const connect = () => {
  if (!promise) {
    promise = MongoClient.connect(MONGO_URI, { useNewUrlParser: true });
  }
  return promise;
};

const database = async (dbName, options) => {
  const client = await connect();
  return client.db(dbName, options);
};

const collection = async (dbName, collName, options) => {
  const db = await database(dbName);
  return db.collection(collName, options);
};

module.exports = {
  connect,
  database,
  collection,
  mongodb,
};
