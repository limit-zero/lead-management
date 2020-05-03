require('./newrelic');

const { isFunction: isFn } = require('@lead-management/utils');
const newrelic = require('./newrelic');

const log = (message) => {
  const { log: emit } = console;
  emit(`> ${message}`);
};

process.on('unhandledRejection', (e) => {
  newrelic.noticeError(e);
  throw e;
});

module.exports = ({
  name,
  init,
  task,
  interval = 30000,
}) => async () => {
  let timesRan = 0;
  if (!name) throw new Error('No task name was provided');
  newrelic.setTransactionName(name);

  if (!isFn(task)) throw new Error('No task function was provided');

  // Run any initialization tasks. Will only run once.
  if (isFn(init)) await init();

  // Call immediately the first time.
  await task({ timesRan });
  timesRan += 1;

  // Then run in intervals.
  let isRunning = false;

  setInterval(async () => {
    // Do not stack tasks.
    if (isRunning) {
      log('Task is currently running. Skipping.');
    } else {
      isRunning = true;
      try {
        await task({ timesRan });
        timesRan += 1;
        isRunning = false;
      } catch (e) {
        newrelic.noticeError(e);
        setImmediate(() => { throw e; });
      }
    }
  }, interval);
};
