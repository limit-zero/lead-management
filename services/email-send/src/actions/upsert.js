const { createError } = require('micro');
const moment = require('moment');
const fetch = require('node-fetch');
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
    ['ID', 'Email.ID', 'SentDate', 'PreviewURL', 'CreatedDate', 'ModifiedDate', 'HardBounces', 'SoftBounces', 'OtherBounces'],
    Object.keys(attrMap),
  );

  const params = {
    by: 'ID',
    value: id,
    props,
  };

  const query = {
    'external.id': Number(id),
    'external.ns': 'MC:Send',
  };

  // @todo Need to determine how to select the db for different tenants (IEN vs. DDT)???
  const collection = await mongodb.collection('lead-management', 'email-sends');
  // Get the send from MC and the database.
  const [send, dbSend] = await Promise.all([
    call('mc-send.retrieve', { params }),
    collection.findOne(query, { projection: { _id: 1 } }),
  ]);

  const {
    Email,
    CreatedDate,
    ModifiedDate,
    Subject,
    HardBounces,
    PreviewURL,
    SoftBounces,
    OtherBounces,
    SentDate,
  } = send;

  // Upsert the deployment.
  call('email-deployment.upsert', { params: { id: Email.ID } });

  // Load the HTML from the preview URL.
  // Unfortunately MC does _not_ maintain a static copy of each send.
  // As such, if the deployment HTML changes, the send HTML will reflect
  // the _current_ deployment HTML... not what was _actually_ sent.
  // To try to prevent this, we'll save the HTML to the DB on insert only.
  let html;
  let urls;
  if (!dbSend) {
    const res = await fetch(PreviewURL);
    html = await res.text();

    // From html, extract the clean URLs.
    const urlMap = await call('url.map-from-html', { params: { html, onInvalid: 'empty' } });
    urls = new Set();
    urlMap.forEach(({ raw, cleaned }) => {
      if (!cleaned) console.log('not found for', raw);
      if (cleaned) urls.add(cleaned);
    });
  }

  const { set, unset } = mapSendData(send);
  const now = new Date();
  const createdAt = moment(CreatedDate).toDate();

  const update = {
    $setOnInsert: {
      rollupMetrics: false,
      isNewsletter: false, // @todo Check this against the category
      url: PreviewURL,
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
  if (html) update.$set.html = html;
  if (urls) update.$set.urls = [...urls];
  if (Object.keys(unset).length) update.$unset = unset;

  const r = await collection.updateOne(query, update, { upsert: true });
  return r;
};
