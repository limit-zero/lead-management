const {
  cleanEnv,
  bool,
  port,
  str,
} = require('envalid');

module.exports = cleanEnv(process.env, {
  EXTERNAL_PORT: port({ desc: 'The external port that the service is exposed on.', default: 80 }),
  INTERNAL_PORT: port({ desc: 'The internal port that the service will run on.', default: 80 }),
  MC_GRAPHQL_URI: str({ desc: 'The Marketing Cloud GraphQL server to connect to.' }),
  MONGO_URI: str({ desc: 'The MongoDB database to connect to.' }),
  NEW_RELIC_ENABLED: bool({ desc: 'Whether New Relic is enabled.', default: true, devDefault: false }),
  NEW_RELIC_LICENSE_KEY: str({ desc: 'The license key for New Relic.', devDefault: '(unset)' }),
});
