require('./newrelic');

const { isFunction: isFn } = require('@lead-management/utils');
const newrelic = require('./newrelic');

process.on('unhandledRejection', (e) => {
  newrelic.noticeError(e);
  throw e;
});

const log = (message) => {
  const { log: emit } = console;
  emit(`> ${message}`);
};

const logStart = ({ timesRan }) => log(`Task iteration ${timesRan + 1} starting...`);
const logComplete = ({ timesRan }) => log(`Task iteration ${timesRan + 1} complete!`);

const run = async ({ task, timesRan }) => {
  logStart({ timesRan });
  await task({ timesRan });
  logComplete({ timesRan });
  return timesRan + 1;
};

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
  log('Initializing task...');
  if (isFn(init)) await init();
  log('Init complete.');

  // Call immediately the first time.
  timesRan = await run({ task, timesRan });

  // Then run in intervals.
  let isRunning = false;
  setInterval(async () => {
    // Do not stack tasks.
    if (isRunning) {
      log('Task is currently running. Skipping.');
    } else {
      isRunning = true;
      try {
        timesRan = await run({ task, timesRan });
        isRunning = false;
      } catch (e) {
        newrelic.noticeError(e);
        setImmediate(() => { throw e; });
      }
    }
  }, interval);
};
