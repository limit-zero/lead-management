const runner = require('../runner');
const mongodb = require('../mongodb');
const log = require('../log');


const init = async () => {
  log('Connecting to MongoDB...');
  await mongodb.connect();
  log(`Connected to ${mongodb.uri}`);
};

const task = async () => {
};

runner({
  name: 'click-log',
  init,
  task,
  interval: 30000,
})();
