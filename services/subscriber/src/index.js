const { jsonService } = require('@limit-zero/lm-micro-service');
const mc = require('@limit-zero/lm-marketing-cloud');
const actions = require('./actions');

module.exports = jsonService({
  init: async () => {
    await mc.client();
  },
  actions,
  ctx: { mc },
});
