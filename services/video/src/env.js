const {
  cleanEnv,
  bool,
  str,
} = require('envalid');

module.exports = cleanEnv(process.env, {
  BRIGHTCOVE_ACCOUNT_ID: str({ desc: 'The Brightcove account ID.' }),
  BRIGHTCOVE_APP_ID: str({ desc: 'The Brightcove API APP ID.' }),
  BRIGHTCOVE_SECRET: str({ desc: 'The Brightcove API secret.' }),
  MONGO_URI: str({ desc: 'The MongoDB database to connect to.' }),
  NEW_RELIC_ENABLED: bool({ desc: 'Whether New Relic is enabled.', default: true, devDefault: false }),
  NEW_RELIC_LICENSE_KEY: str({ desc: 'The license key for New Relic.', devDefault: '(unset)' }),
});
