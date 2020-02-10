const { createClient } = require('@lead-management/mc-graphql-client');
const { MC_GRAPHQL_URI } = require('./env');

module.exports = () => ({
  primary: createClient({ uri: MC_GRAPHQL_URI }),
});
