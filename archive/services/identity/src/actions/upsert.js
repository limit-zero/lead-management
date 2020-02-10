const { createError } = require('micro');
const moment = require('moment');
const call = require('@limit-zero/lm-micro-client');
const { formatEmail } = require('@limit-zero/lm-common');
const mapIdentityData = require('../utils/map-identity-data');

/**
 * Indexes needed:
 * - `{ "external.ns": 1, "external.id": 1 }, { unique: true }`
 * - `{ emailAddress: 1 }`
 *
 * Notes:
 * - The external identifier value is now a `Number` _not_ a `String`.
 * - The external namespace is now prefix with `MC:` instead of `FuelSOAP:`.
 * - The `externalSource` key has been renamed to `external`.
 * - The `externalSource.namespace` key has been renamed to `ns`.
 * - The `externalSource.identifier` key has been renamed to `id`.
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
    'external.id': Number(ID),
    'external.ns': 'MC:Subscriber',
  };

  const now = new Date();
  const { set, unset } = mapIdentityData(subscriber);
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
      ...set,
      fieldCount: Object.keys(set).length + 1,
      updatedAt: now,
      'external.createdAt': moment(CreatedDate).toDate(),
      'external.lastRetrievedAt': now,
    },
  };
  if (Object.keys(unset).length) update.$unset = unset;

  const r = await collection.updateOne(query, update, { upsert: true });
  return r;
};
