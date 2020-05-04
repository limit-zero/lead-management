const { checkArray, checkRequired } = require('@lead-management/micro/utils');
const mongodb = require('../mongodb');

const getCollection = () => mongodb.collection('leads-graph', 'mc-upsert-queue');

const createOp = ({ namespace, identifier }) => {
  checkRequired('namespace', namespace);
  checkRequired('identifier', identifier);

  const criteria = { namespace, identifier };
  return {
    updateOne: {
      filter: criteria,
      update: { $setOnInsert: criteria, $set: { last: new Date() } },
      upsert: true,
    },
  };
};

const bulkAdd = async ({ items } = {}) => {
  checkArray('items', items);
  const bulkOps = items.map(createOp);
  const coll = await getCollection();
  return coll.bulkWrite(bulkOps);
};

module.exports = {
  /**
   *
   */
  find: async ({ query = {}, options = {} } = {}) => {
    const coll = await getCollection();
    const defaultOptions = { limit: 50, sort: { last: 1 } };
    return coll.find(query, { ...defaultOptions, ...options }).toArray();
  },
  /**
   *
   */
  add: ({ namespace, identifier } = {}) => bulkAdd({ items: [{ namespace, identifier }] }),

  /**
   *
   */
  bulkAdd,
};
