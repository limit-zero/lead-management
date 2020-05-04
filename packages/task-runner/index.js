const { isFunction: isFn } = require('@lead-management/utils');
const log = require('./log');

const logStart = ({ timesRan }) => log(`Task iteration ${timesRan + 1} starting...`);
const logComplete = ({ timesRan }) => log(`Task iteration ${timesRan + 1} complete!`);

const run = async ({ task, timesRan }) => {
  logStart({ timesRan });
  await task({ timesRan });
  logComplete({ timesRan });
  return timesRan + 1;
};

const runOnError = (onError, e) => {
  if (isFn(onError)) onError(e);
};

module.exports = ({
  name,
  init,
  task,
  interval = 30000,
  onError,
}) => async () => {
  process.on('unhandledRejection', (e) => {
    runOnError(onError, e);
    throw e;
  });

  let timesRan = 0;
  if (!name) throw new Error('No task name was provided');

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
        runOnError(onError, e);
        setImmediate(() => { throw e; });
      }
    }
  }, interval);
};
