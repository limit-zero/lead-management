const { createTerminus } = require('@godaddy/terminus');
const { TERMINUS_TIMEOUT, TERMINUS_SHUTDOWN_DELAY } = require('./env');
const {
  isFn,
  log,
  emitError,
  wait,
} = require('./utils');

module.exports = async ({
  name,
  version,
  server,
  port,
  exposedPort,

  onStart,
  onError,
  onHealthCheck,
  onSignal,
  beforeShutdown,
  onShutdown,

  signals = ['SIGTERM', 'SIGINT'],
  healthCheckPath = '/_health',
} = {}) => {
  log(`Booting ${name} v${version}...`);

  // Do not try/catch here - fail boot if this fails.
  log('Awaiting required services...');
  if (isFn(onStart)) await onStart();
  log('Services loaded.');

  createTerminus(server, {
    timeout: TERMINUS_TIMEOUT,
    signals,
    healthChecks: {
      [healthCheckPath]: isFn(onHealthCheck) ? onHealthCheck : () => ({ ping: 'pong ' }),
    },
    onSignal: async () => {
      log('Running on-signal hook...');
      try {
        if (isFn(onSignal)) await onSignal();
      } catch (e) {
        log('ON-SIGNAL ERROR DETECTED!');
        emitError(e, onError);
      } finally {
        log('Signal complete.');
      }
    },
    beforeShutdown: async () => {
      log('Running before-shutdown hook...');
      try {
        if (isFn(beforeShutdown)) await beforeShutdown();
        if (TERMINUS_SHUTDOWN_DELAY) {
          log(`Delaying shutdown by ${TERMINUS_SHUTDOWN_DELAY}ms...`);
          await wait(TERMINUS_SHUTDOWN_DELAY);
        }
      } catch (e) {
        log('BEFORE-SHUTDOWN ERROR DETECTED!');
        emitError(e, onError);
      } finally {
        log('Before shutdown complete.');
      }
    },
    onShutdown: async () => {
      log('Running on-shutdown hook...');
      try {
        if (isFn(onShutdown)) await onShutdown();
      } catch (e) {
        log('ON-SHUTDOWN ERROR DETECTED!');
        emitError(e, onError);
      } finally {
        log('Shutdown complete.');
      }
    },
  });

  server.listen(port, () => log(`Ready on http://0.0.0.0:${exposedPort || port}`));
};
