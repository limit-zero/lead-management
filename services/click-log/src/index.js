require('./newrelic');

const runner = require('@lead-management/task-runner');
const log = require('@lead-management/task-runner/log');
const newrelic = require('./newrelic');
const mongodb = require('./mongodb');
const task = require('./task');

const name = 'click-log';

const init = async () => {
  newrelic.setTransactionName(name);
  log('Connecting to MongoDB...');
  await mongodb.connect();
  log(`Connected to ${mongodb.uri}`);
};

runner({
  name,
  init,
  task,
  interval: 10000,
  onError: newrelic.noticeError.bind(newrelic),
})();
