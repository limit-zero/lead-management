require('./newrelic');

const bootService = require('@lead-management/terminus/boot-service');
const newrelic = require('./newrelic');
const server = require('./server');
const mongodb = require('./mongodb');
const pkg = require('../package.json');
const { INTERNAL_PORT, EXTERNAL_PORT } = require('./env');

process.on('unhandledRejection', (e) => {
  newrelic.noticeError(e);
  throw e;
});

bootService({
  name: pkg.name,
  version: pkg.version,
  server,
  port: INTERNAL_PORT,
  exposedPort: EXTERNAL_PORT,
  onError: newrelic.noticeError.bind(newrelic),
  onStart: () => mongodb.connect(),
  onSignal: () => mongodb.close(),
  onHealthCheck: () => mongodb.ping(),
}).catch((e) => setImmediate(() => {
  newrelic.noticeError(e);
  throw e;
}));
