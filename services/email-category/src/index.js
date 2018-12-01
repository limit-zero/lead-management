const { jsonService } = require('@limit-zero/lm-micro-service');
const mongodb = require('@limit-zero/lm-mongodb');
const actions = require('./actions');

module.exports = jsonService({
  init: async () => {
    await mongodb.connect();
  },
  actions,
  ctx: { mongodb },
});
