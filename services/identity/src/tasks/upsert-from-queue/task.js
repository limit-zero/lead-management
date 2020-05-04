const log = require('@lead-management/task-runner/log');
const mongodb = require('../../mongodb');
const upsertMany = require('../../actions/upsert-many');

module.exports = async () => {
  log('Loading subscribers from queue...');
  const namespace = 'Subscriber';
  const coll = await mongodb.collection('leads-graph', 'mc-upsert-queue');
  // load 500 records, oldest first.
  const cursor = await coll.find({ namespace }, { limit: 500, sort: { last: 1 } });

  const subscriberIds = [];
  await mongodb.iterateCursor(cursor, (doc) => {
    subscriberIds.push(doc.identifier);
  });
  log(`Found ${subscriberIds.length} subscribers in queue`);

  if (subscriberIds.length) {
    log('Upserting subscribers...');
    // upsert
    const { upserted } = await upsertMany({ subscriberIds });
    log(`Upserted ${upserted} records`);

    // remove
    log('Removing subscribers from the queue...');
    await coll.removeMany({ namespace, identifier: { $in: subscriberIds } });
    log('Subscribers removed');
  }
  log('Upsert from queue complete');
};
