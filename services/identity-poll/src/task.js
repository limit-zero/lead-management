const call = require('@limit-zero/lm-micro-client');
const mongodb = require('@limit-zero/lm-mongodb');
const { formatEmail, elapsed } = require('@limit-zero/lm-common');

const { log } = console;
const { hrtime } = process;

/**
 * Note: errors thrown from this method will trigger the global
 * setImediate() throw. Should log like crazy when this happens!
 */
module.exports = async () => {
  const start = hrtime();
  log('\nStarting task at', new Date());
  const collection = await mongodb.collection('mc-queues', 'subscribers');

  // Retrieve any subscribers in the queue, but limit the max amount.
  const limit = 500;

  let docs = await collection.find().limit(limit).toArray();
  log(`Found ${docs.length} subscribers in queue.`);

  if (!docs.length) return;


  let ids = [];
  /**
   * @todo How should a single error be handled here?
   * If a bad email address is inserted, it will fail the entire batch.
   * Should probably determine how to flag bad records for review?
   * Otherwise the poll will get stuck on the bad record.
   */
  let results = await Promise.all(docs.map((doc) => {
    // @todo Determine how to handle the ClientID.
    const { SubscriberKey, _id } = doc;
    ids.push(_id);
    const params = { emailAddress: formatEmail(SubscriberKey) };
    return call('identity.upsert', { params });
  }));
  log(`Upserted ${results.length} subscribers as identities.`);
  results = null;
  docs = null;

  // Delete the queued subscribers.
  await collection.deleteMany({ _id: { $in: ids } });
  ids = null;
  log('Task complete at', new Date(), 'Took', elapsed(start), '\n');
};

