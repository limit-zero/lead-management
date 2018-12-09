const mongodb = require('@limit-zero/lm-mongodb');
const task = require('./task');

const { log } = console;

const run = async () => {
  await mongodb.connect();
  log('MongoDB connected');
  // Call immediately the first time.
  await task();
  // Then run in intervals afterwards.
  let isRunning = false;
  setInterval(() => {
    // Prevent the interval from "stacking"
    if (!isRunning) {
      isRunning = true;
      task().then(() => {
        isRunning = false;
      }).catch(e => setImmediate(() => { throw e; }));
    } else {
      log('Task is currently running. Skipping.');
    }
  }, 15000);
};

run().catch(e => setImmediate(() => { throw e; }));
