const { BrightcoveCMS, BrightcoveAnalytics } = require('@lead-management/brightcove');
const { BRIGHTCOVE_ACCOUNT_ID, BRIGHTCOVE_APP_ID, BRIGHTCOVE_SECRET } = require('./env');

const params = {
  accountId: BRIGHTCOVE_ACCOUNT_ID,
  appId: BRIGHTCOVE_APP_ID,
  secret: BRIGHTCOVE_SECRET,
};

module.exports = {
  cms: new BrightcoveCMS(params),
  analytics: new BrightcoveAnalytics(params),
};
