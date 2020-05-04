const { checkArray, checkRequired } = require('@lead-management/micro/utils');
const mongodb = require('../mongodb');

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
  const coll = await mongodb.collection('leads-graph', 'mc-upsert-queue');
  return coll.bulkWrite(bulkOps);
};

module.exports = {
  add: ({ namespace, identifier } = {}) => bulkAdd({ items: [{ namespace, identifier }] }),
  bulkAdd,
};
