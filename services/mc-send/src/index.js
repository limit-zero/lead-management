const { jsonService } = require('@limit-zero/lm-micro-service');
const mc = require('@limit-zero/lm-marketing-cloud');
const actions = require('./actions');

let promise;
module.exports = jsonService({
  init: () => {
    if (!promise) promise = mc.client();
    return promise;
  },
  actions,
  ctx: { mc },
});
