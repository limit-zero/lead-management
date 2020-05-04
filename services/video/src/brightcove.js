const { BrightcoveCMS } = require('@lead-management/brightcove');
const { BRIGHTCOVE_ACCOUNT_ID, BRIGHTCOVE_APP_ID, BRIGHTCOVE_SECRET } = require('./env');

module.exports = {
  cms: new BrightcoveCMS({
    accountId: BRIGHTCOVE_ACCOUNT_ID,
    appId: BRIGHTCOVE_APP_ID,
    secret: BRIGHTCOVE_SECRET,
  }),
};
