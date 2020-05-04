const log = require('@lead-management/task-runner/log');

const extractUrlId = require('./extract-url-id');
const getCollection = require('./get-collection');

module.exports = async ({ rows }) => {
  log('Upserting into database...');
  const bulkOps = rows.map((row) => {
    const urlId = extractUrlId(row.url);
    const $setOnInsert = {
      ...row,
      ...(urlId && { urlId }),
    };
    return {
      updateOne: {
        filter: { _id: row._id },
        update: { $setOnInsert },
        upsert: true,
      },
    };
  });
  const coll = await getCollection();
  await coll.bulkWrite(bulkOps);
  log('Upsert complete.');
};
