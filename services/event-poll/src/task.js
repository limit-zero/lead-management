const mongodb = require('@limit-zero/lm-mongodb');
const mc = require('@limit-zero/lm-marketing-cloud');
const { formatEmail } = require('@limit-zero/lm-common');
const moment = require('moment-timezone');
const objectPath = require('object-path');

const { log } = console;

const getLastID = async () => {
  let lastId = 109528988;
  const coll = await mongodb.collection('mc-queues', 'identifiers');
  const doc = await coll.findOne({ type: 'click-event' }, {
    projection: { value: 1 },
    sort: [['value', -1]],
  });
  if (doc) lastId = doc.value;
  return lastId;
};

/**
 * Requires indexes:
 *
 * mc-queues.identifiers
 * - `{ "type": 1 }, { unique: true }`
 *
 * mc-queues.sends
 * - `{ "ClientID": 1, "SendID": 1 }, { unique: true }`
 *
 * mc-queues.subscribers
 * - `{ "ClientID": 1, "SubscriberKey": 1 }, { unique: true }`
 *
 * mc-queues.event-urls
 * - `{ "ClientID": 1, "URLID": 1 }, { unique: true }`
 *
 * mc-queues.click-events
 * - `{ "ClientID": 1, "ID": 1 }, { unique: true }`
 */
module.exports = async () => {
  log('\nStarting task.');
  const [last, subColl, sendColl, idColl, urlColl, eventColl] = await Promise.all([
    getLastID(),
    mongodb.collection('mc-queues', 'subscribers'),
    mongodb.collection('mc-queues', 'sends'),
    mongodb.collection('mc-queues', 'identifiers'),
    mongodb.collection('mc-queues', 'event-urls'),
    mongodb.collection('mc-queues', 'click-events'),
  ]);

  const props = ['ID', 'SendID', 'SubscriberKey', 'EventDate', 'URL', 'URLID', 'Client.ID'];
  const Filter = {
    attributes: { 'xsi:type': 'SimpleFilterPart' },
    Property: 'ID',
    SimpleOperator: 'greaterThan',
    Value: last,
  };

  log(`Retrieving events since ID ${last}`);
  const response = await mc.retrieve('ClickEvent', props, {
    Filter,
  });

  const results = Array.isArray(response.Results) ? response.Results : [];
  log(`Found ${results.length} events.`);

  const subscriber = new Map();
  const send = new Map();
  const url = new Map();
  const event = new Map();
  let lastEventId = null;

  // Create a unique list of subscriber keys and send ids
  results.forEach((r) => {
    const {
      ID,
      SendID,
      URLID,
      URL,
    } = r;
    const SubscriberKey = formatEmail(r.SubscriberKey);
    const EventDate = moment.tz(moment(r.EventDate).format('YYYY-MM-DDTHH:mm:ss'), 'America/Chicago').toDate();
    const ClientID = objectPath.get(r, 'Client.ID');
    lastEventId = ID;

    subscriber.set(`${ClientID}.${SubscriberKey}`, {
      updateOne: {
        filter: { ClientID, SubscriberKey },
        update: { $setOnInsert: { ClientID, SubscriberKey } },
        upsert: true,
      },
    });

    send.set(`${ClientID}.${SendID}`, {
      updateOne: {
        filter: { ClientID, SendID },
        update: { $setOnInsert: { ClientID, SendID } },
        upsert: true,
      },
    });

    url.set(`${ClientID}.${URLID}`, {
      updateOne: {
        filter: { ClientID, URLID },
        update: { $setOnInsert: { ClientID, URLID, SendID } },
        upsert: true,
      },
    });

    event.set(`${ClientID}.${ID}`, {
      updateOne: {
        filter: { ClientID, ID },
        update: {
          $setOnInsert: {
            ClientID,
            ID,
            EventDate,
            SubscriberKey,
            SendID,
            URLID,
            URL,
          },
        },
        upsert: true,
      },
    });

  });

  const subscriberOps = [...subscriber.values()];
  const sendOps = [...send.values()];
  const urlOps = [...url.values()];
  const eventOps = [...event.values()];

  await Promise.all([
    subscriberOps.length ? subColl.bulkWrite(subscriberOps) : Promise.resolve(null),
    sendOps.length ? sendColl.bulkWrite(sendOps) : Promise.resolve(null),
    urlOps.length ? urlColl.bulkWrite(urlOps) : Promise.resolve(null),
    eventOps.length ? eventColl.bulkWrite(eventOps) : Promise.resolve(null),
  ]);
  log('Subscribers written:', subscriberOps.length);
  log('Sends written:', sendOps.length);
  log('URLs written:', urlOps.length);
  log('Events written:', eventOps.length);

  await idColl.updateOne({ type: 'click-event' }, {
    $set: {
      type: 'click-event',
      value: lastEventId,
    },
  }, { upsert: true });
  log('Task complete. Last event ID', lastEventId, '\n');
};
