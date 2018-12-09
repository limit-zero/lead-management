const { jsonService } = require('@limit-zero/lm-micro-service');
const mongodb = require('@limit-zero/lm-mongodb');
const actions = require('./actions');

let promise;
module.exports = jsonService({
  init: () => {
    if (!promise) promise = mongodb.connect();
    return promise;
  },
  actions,
  ctx: { mongodb },
});
