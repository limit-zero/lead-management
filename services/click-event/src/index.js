const { jsonService } = require('@limit-zero/lm-micro-service');
const actions = require('./actions');

module.exports = async (req, res) => jsonService({
  actions,
  req,
  res,
});
