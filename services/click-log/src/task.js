const getLastDate = require('./utils/get-last-date');
const retrieveRows = require('./utils/retrieve-rows');
const flagUpserts = require('./utils/flag-upserts');
const bulkWrite = require('./utils/bulk-write');

module.exports = async () => {
  const since = await getLastDate();
  // process in one-hour chunks
  const notAfter = new Date(since.getTime() + (1 * 60 * 60 * 1000));

  const rows = await retrieveRows({ since, notAfter });
  await flagUpserts({ rows });
  await bulkWrite({ rows });
};
