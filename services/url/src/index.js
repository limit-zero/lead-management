const { jsonService } = require('@limit-zero/lm-micro-service');
const mongodb = require('./mongodb');
const actions = require('./actions');

// @todo Do we bring in micro programatically
// so we can control graceful and startup errors?
let promise;
module.exports = jsonService({
  init: () => {
    if (!promise) promise = mongodb.connect();
    return promise;
  },
  actions,
  ctx: { mongodb },
});
