const { getAsArray } = require('@lead-management/utils');
const createClient = require('../graphql/create-client');
const mongodb = require('../mongodb');
const { SUBSCRIBER_TO_UPSERT } = require('../graphql/queries');
const buildBulkOps = require('./utils/build-bulk-ops');

module.exports = async ({ subscriberId }) => {
  const graphql = createClient();
  const variables = { subscriberId: `${subscriberId}` };
  const { data } = await graphql.query({ query: SUBSCRIBER_TO_UPSERT, variables });
  const nodes = getAsArray(data, 'subscribers.edges').map((edge) => edge.node);
  const bulkOps = await buildBulkOps({ nodes });
  if (bulkOps.length) {
    const coll = await mongodb.collection('leads-graph', 'identities');
    await coll.bulkWrite(bulkOps);
  }
  return bulkOps;
};
