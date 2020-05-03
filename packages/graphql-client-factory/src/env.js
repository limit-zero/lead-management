const {
  cleanEnv,
  str,
} = require('envalid');

module.exports = cleanEnv(process.env, {
  MC_GRAPHQL_URI: str({ desc: 'The primary Marketing Cloud GraphQL API to connect to.' }),
});
