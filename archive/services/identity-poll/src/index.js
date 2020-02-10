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
    // Prevent the interval from "stacking" tasks.
    if (!isRunning) {
      isRunning = true;
      task().then(() => {
        isRunning = false;
      }).catch(e => setImmediate(() => { throw e; })); // @todo Log this!
    } else {
      log('Task is currently running. Skipping.');
    }
  }, 15000);
};

// @todo Add unhandled rejection and log!

run().catch(e => setImmediate(() => { throw e; })); // @todo Log this!
