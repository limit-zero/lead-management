const runner = require('../../runner');
const mongodb = require('../../mongodb');
const log = require('../../log');
const task = require('./task');

const init = async () => {
  log('Connecting to MongoDB...');
  await mongodb.connect();
  log(`Connected to ${mongodb.uri}`);
};

runner({
  name: 'click-log',
  init,
  task,
  interval: 10000,
})();
