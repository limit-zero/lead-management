const { createError } = require('micro');
const moment = require('moment');
const call = require('@limit-zero/lm-micro-client');
const attrMap = require('../utils/attr-map');
const mapSendData = require('../utils/map-send-data');

/**
 * Indexes needed:
 * - `{ "external.ns": 1, "external.id": 1 }, { unique: true }`
 * - `{ "external.deploymentId": 1 }`
 *
 * Notes:
 * - The external identifier value is now a `Number` _not_ a `String`.
 * - The external namespace is now prefix with `MC:` instead of `FuelSOAP:`.
 * - The `externalSource` key has been renamed to `external`.
 * - The `externalSource.namespace` key has been renamed to `ns`.
 * - The `externalSource.identifier` key has been renamed to `id`.
 */
module.exports = async ({ id }, { mongodb }) => {
  if (!id) throw createError(400, "No 'id' value was provided.");

  const props = [].concat(
    ['ID', 'Email.ID', 'SentDate', 'CreatedDate', 'ModifiedDate', 'HardBounces', 'SoftBounces', 'OtherBounces'],
    Object.keys(attrMap),
  );

  const params = {
    by: 'ID',
    value: id,
    props,
  };

  // @todo Need to determine how to select the db for different tenants (IEN vs. DDT)???
  const [collection, send] = await Promise.all([
    mongodb.collection('lead-management', 'email-sends'),
    call('mc-send.retrieve', { params }),
  ]);

  const {
    ID,
    Email,
    CreatedDate,
    ModifiedDate,
    Subject,
    HardBounces,
    SoftBounces,
    OtherBounces,
    SentDate,
  } = send;

  // Upsert the deployment.
  call('email-deployment.upsert', { params: { id: Email.ID } });

  const query = {
    'external.id': Number(ID),
    'external.ns': 'MC:Send',
  };

  const { set, unset } = mapSendData(send);
  const now = new Date();
  const createdAt = moment(CreatedDate).toDate();

  const update = {
    $setOnInsert: {
      rollupMetrics: false,
      createdAt: now,
      'external.deploymentId': Number(Email.ID),
      'external.createdAt': createdAt,
      __v: 0,
      ...query,
    },
    $set: {
      ...set,
      updatedAt: now,
      sentDate: SentDate ? moment(SentDate).toDate() : null,
      isTestSend: /^test send/i.test(Subject),
      'metrics.bounces': (HardBounces || 0) + (SoftBounces || 0) + (OtherBounces || 0),
      'external.updatedAt': ModifiedDate ? moment(ModifiedDate).toDate() : createdAt,
      'external.lastRetrievedAt': now,
    },
  };
  if (Object.keys(unset).length) update.$unset = unset;

  const r = await collection.updateOne(query, update, { upsert: true });
  return r;
};
