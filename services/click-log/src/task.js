const log = require('@lead-management/task-runner/log');

const getLastDate = require('./utils/get-last-date');
const retrieveRows = require('./utils/retrieve-rows');
const flagUpserts = require('./utils/flag-upserts');
const bulkWrite = require('./utils/bulk-write');

const task = async ({ requestId } = {}) => {
  const since = await getLastDate();
  // process in two-hour chunks
  const notAfter = new Date(since.getTime() + (2 * 60 * 60 * 1000));

  if (!requestId) {
    log(`Running task for events between ${since.toISOString()} and ${notAfter.toISOString()}`);
  } else {
    log(`Continuing request using ${requestId}...`);
  }

  const { rows, pageInfo } = await retrieveRows({ since, notAfter, requestId });
  await flagUpserts({ rows });
  await bulkWrite({ rows });

  if (pageInfo.hasMoreData) {
    log('More data found.');
    await task({ requestId: pageInfo.requestId });
  }
};

module.exports = task;
