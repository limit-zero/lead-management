const { getAsArray } = require('@lead-management/utils');
const createClient = require('../../graphql/create-client');
const { SUBSCRIBERS_TO_UPSERT, SUBSCRIBER_TO_UPSERT } = require('../../graphql/queries');
const mongodb = require('../../mongodb');
const buildBulkOps = require('./build-bulk-ops');

const retrieveSubscribers = async (subscriberIds) => {
  const graphql = createClient();
  if (subscriberIds.length === 1) {
    return graphql.query({
      query: SUBSCRIBER_TO_UPSERT,
      variables: { subscriberId: `${subscriberIds[0]}` },
    });
  }
  return graphql.query({
    query: SUBSCRIBERS_TO_UPSERT,
    variables: { subscriberIds: subscriberIds.map((id) => `${id}`) },
  });
};

module.exports = async ({ subscriberIds }) => {
  const { data } = await retrieveSubscribers(subscriberIds);
  const nodes = getAsArray(data, 'subscribers.edges').map((edge) => edge.node);
  const bulkOps = await buildBulkOps({ nodes });
  if (bulkOps.length) {
    const coll = await mongodb.collection('leads-graph', 'identities');
    await coll.bulkWrite(bulkOps);
  }
  return { upserted: bulkOps.length };
};
