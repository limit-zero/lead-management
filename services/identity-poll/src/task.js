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

  // Only returned non-errored items.
  let docs = await collection.find({ error: { $exists: false } }).limit(limit).toArray();
  log(`Found ${docs.length} subscribers in queue.`);

  const completed = [];
  const errored = [];

  await Promise.all(docs.map((doc) => {
    // @todo Determine how to handle the ClientID.
    const { SubscriberKey, _id } = doc;
    const params = { emailAddress: formatEmail(SubscriberKey) };
    return call('identity.upsert', { params }).then(() => completed.push(_id)).catch((e) => {
      const { statusCode } = e;
      errored.push([_id, e]); // @todo This should log!
      // Re-throw if a 500 (or unknown).
      // This will crash the service and force a restart.
      if (!statusCode || statusCode >= 500) throw e;
    });
  }));
  log(`Upserted ${completed.length} identities.`);

  // Flag errorerd subscribers.
  const updateOps = errored.map(([_id, e]) => {
    const { message, statusCode } = e;
    return {
      updateOne: {
        filter: { _id },
        update: { $set: { error: { message, statusCode } } },
      },
    };
  });
  if (updateOps.length) {
    log(`ERRORS found for ${updateOps.length} subscribers. Flagged.`);
    await collection.bulkWrite(updateOps);
  }

  // Delete the queued subscribers.
  if (completed.length) {
    await collection.deleteMany({ _id: { $in: completed } });
    log(`Removed ${completed.length} subscribers from the queue`);
  }
  log('Task complete at', new Date(), 'Took', elapsed(start), '\n');
};

