const { getAsArray, getAsObject } = require('@lead-management/utils');
const log = require('@lead-management/task-runner/log');
const createClient = require('../graphql/create-client');
const { CLICK_LOG_OBJECTS } = require('../graphql/queries');
const formatValue = require('./format-value');

const fieldMap = {
  ID: '_id',
  JobID: 'sendId',
  SubscriberID: 'subscriberId',
  EventDate: 'date',
  IsBot_V3: 'isBot',
  LinkContent: 'url',
};

module.exports = async ({ since, notAfter, requestId }) => {
  const graphql = createClient();

  log('Retrieving click data from GraphQL...');
  const variables = {
    since: since.toISOString(),
    notAfter: notAfter.toISOString(),
    requestId,
  };
  const { data } = await graphql.query({ query: CLICK_LOG_OBJECTS, variables });

  const pageInfo = getAsObject(data, 'dataExtension.objects.pageInfo');

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
  return { rows, pageInfo };
};
