const { getAsArray } = require('@lead-management/utils');
const clients = require('@lead-management/clients');
const log = require('@lead-management/task-runner/log');
const mongodb = require('./mongodb');
const createClient = require('./graphql/create-client');
const { CLICK_LOG_OBJECTS } = require('./graphql/queries');

const { ObjectId } = mongodb.mongodb;

const getCollection = () => mongodb.collection('leads-graph', 'mc-click-log');

const getLastEventDate = async () => {
  log('Retrieving last event date...');
  const defaultDate = new Date(Date.parse('2020-05-01T00:00:00-0600'));
  const coll = await getCollection();
  const lastDoc = await coll.findOne({}, { sort: { date: -1 }, projection: { date: 1 } });
  const since = lastDoc ? lastDoc.date : defaultDate;
  log(`Last event date found: ${since.toISOString()}`);
  return since;
};

const formatValue = ({ fields, name, value }) => {
  const type = fields[name];
  // force an offset of six hours
  // marketing cloud ignores CDT and uses all dates in CST
  const tzOffset = 6 * 60 * 60 * 1000;

  switch (type) {
    case 'Boolean':
      if (value === 'False' || value === 'false' || value === '0') return false;
      if (value === 'True' || value === 'true') return true;
      return Boolean(value);
    case 'Number':
      return Number(value);
    case 'Date':
      return new Date(Date.parse(value) + tzOffset);
    default:
      if (value === 'False' || value === 'false') return false;
      if (value === 'True' || value === 'true') return true;
      return value;
  }
};

const extractUrlId = (value) => {
  const pattern = /leads\.limit0\.io\/click\/([a-f0-9]{24})/;
  const matches = pattern.exec(value);
  return matches && matches[1] ? ObjectId(matches[1]) : null;
};

const fieldMap = {
  ID: '_id',
  JobID: 'sendId',
  SubscriberID: 'subscriberId',
  EventDate: 'date',
  IsBot_V3: 'isBot',
  LinkContent: 'url',
};

module.exports = async () => {
  const graphql = createClient();
  const since = await getLastEventDate();
  // process in one-hour chunks
  const notAfter = new Date(since.getTime() + (1 * 60 * 60 * 1000));

  log('Retrieving click data from GraphQL...');
  const variables = { since: since.toISOString(), notAfter: notAfter.toISOString() };
  const { data } = await graphql.query({ query: CLICK_LOG_OBJECTS, variables });
  // @todo handle pagination.

  const fields = getAsArray(data, 'dataExtension.fields.edges').map((edge) => edge.node).reduce((o, field) => {
    const { name, type } = field;
    return { ...o, [name]: type };
  }, {});
  const rows = getAsArray(data, 'dataExtension.objects.edges').map((edge) => edge.node.properties.reduce((o, prop) => {
    const { name, value } = prop;
    const key = fieldMap[name] || name;
    return { ...o, [key]: formatValue({ fields, name, value }) };
  }, {}));
  log(`Data retrieved. Found ${rows.length} rows.`);


  log('Flagging subscribers and sends for upsert...');
  const subscriberIds = new Set();
  const sendIds = new Set();
  rows.forEach((row) => {
    subscriberIds.add(row.subscriberId);
    sendIds.add(row.sendId);
  });
  await clients.queue.request('bulkAdd', {
    items: [
      ...[...sendIds].map((id) => ({ namespace: 'Send', identifier: id })),
      ...[...subscriberIds].map((id) => ({ namespace: 'Subscriber', identifier: id })),
    ],
  });
  log(`${subscriberIds.size} subscriber(s) and ${sendIds.size} send(s) flagged.`);

  log('Upserting into database...');
  const bulkOps = rows.map((row) => {
    const urlId = extractUrlId(row.url);
    const $setOnInsert = {
      ...row,
      ...(urlId && { urlId }),
    };
    return {
      updateOne: {
        filter: { _id: row._id },
        update: { $setOnInsert },
        upsert: true,
      },
    };
  });
  const coll = await getCollection();
  await coll.bulkWrite(bulkOps);
  log('Upsert complete.');
};