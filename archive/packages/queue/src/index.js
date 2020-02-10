const sqs = require('./sqs');

const { log } = console;
log('here');
sqs.listQueues({}, (err, data) => {
  if (err) {
    log('ERROR', err);
  } else {
    log('Success', data);
  }
});
