const {
  cleanEnv,
  bool,
  str,
} = require('envalid');

module.exports = cleanEnv(process.env, {
  MONGO_URI: str({ desc: 'The MongoDB database to connect to.' }),
  NEW_RELIC_ENABLED: bool({ desc: 'Whether New Relic is enabled.', default: true, devDefault: false }),
  NEW_RELIC_LICENSE_KEY: str({ desc: 'The license key for New Relic.', devDefault: '(unset)' }),
});
