const { checkArray } = require('@lead-management/micro/utils');
const clientFactory = require('@lead-management/graphql-client-factory');
const gql = require('graphql-tag');
const cleanIds = require('../utils/clean-ids');

const query = gql`

query SendsToQueue($input: SendsQueryInput!) {
  sends(input: $input) {
    edges {
      node {
        id
        emailName
      }
    }
  }
}

`;

module.exports = async ({ ids } = {}) => {
  checkArray('ids', ids);
  const cleaned = cleanIds(ids);
  const { primary: graphql } = clientFactory();
  const variables = { input: { ids: cleaned } };
  const { data } = await graphql.query({ query, variables });
  return { ...data };
};
