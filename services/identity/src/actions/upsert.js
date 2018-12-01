const { createError } = require('micro');
const call = require('@limit-zero/lm-micro-client');
const { formatEmail } = require('@limit-zero/lm-common');
const mapIdentityData = require('../utils/map-identity-data');

/**
 * Indexes needed:
 * - `{ "external.namespace": 1, "external.identifier": 1 }, { unique: true }`
 * - `{ emailAddress: 1 }`
 *
 * Notes:
 * - The external identifier value is now a `Number` _not_ a `String`.
 * - The `externalSource` key has been renamed to `external`.
 */
module.exports = async ({ emailAddress }, { mongodb }) => {
  const email = formatEmail(emailAddress);
  if (!email) throw createError(400, "No 'emailAddress' value was provided.");

  const params = {
    by: 'SubscriberKey',
    value: email,
    props: ['ID', 'EmailAddress', 'CreatedDate'],
  };

  // @todo Need to determine how to select the db for different tenants (IEN vs. DDT)???
  const [collection, subscriber] = await Promise.all([
    mongodb.collection('lead-management', 'identities'),
    call('mc-subscriber.retrieve', { params }),
  ]);

  const { ID, CreatedDate } = subscriber;
  const query = {
    'external.namespace': 'FuelSOAP:Subscriber',
    'external.identifier': Number(ID),
  };

  const now = new Date();
  const data = mapIdentityData(subscriber);

  const update = {
    $setOnInsert: {
      emailAddress: email,
      createdAt: now,
      inactive: false,
      inactiveCustomerIds: [],
      inactiveCampaignIds: [],
      __v: 0,
      ...query,
    },
    $set: {
      ...data,
      fieldCount: Object.keys(data).length + 1,
      updatedAt: now,
      'external.createdAt': CreatedDate,
      'external.lastRetrievedAt': now,
    },
  };
  const r = await collection.updateOne(query, update, { upsert: true });
  return r;
};
