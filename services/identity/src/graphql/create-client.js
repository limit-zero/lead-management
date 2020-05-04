const { createClient } = require('@lead-management/mc-graphql-client');
const { MC_GRAPHQL_URI } = require('../env');

/**
 * Returns as a function to ensure cache only survives a single request.
 */
module.exports = () => createClient({ uri: MC_GRAPHQL_URI });
