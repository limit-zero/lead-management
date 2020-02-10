require('./newrelic');
const { service } = require('@base-cms/micro');
const actions = require('./actions');
const newrelic = require('./newrelic');

process.on('unhandledRejection', (e) => {
  newrelic.noticeError(e);
  throw e;
});

module.exports = service.json({
  actions,
  onError: (e) => newrelic.noticeError(e),
});
