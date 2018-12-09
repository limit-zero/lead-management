const { jsonService } = require('@limit-zero/lm-micro-service');
const mongodb = require('./mongodb');
const actions = require('./actions');

// @todo This is reconnecting to mongo on every request??
module.exports = jsonService({
  init: async () => {
    await mongodb.connect();
  },
  actions,
});
