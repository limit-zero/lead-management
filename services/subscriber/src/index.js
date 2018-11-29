const { jsonService } = require('@limit-zero/lm-micro-service');
const mc = require('@limit-zero/lm-marketing-cloud');
const actions = require('./actions');

module.exports = async (req, res) => {
  await mc.client();
  return jsonService({
    actions,
    req,
    res,
    ctx: { mc },
  });
};
