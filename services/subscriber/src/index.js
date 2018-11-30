const { send } = require('micro');
const { jsonService } = require('@limit-zero/lm-micro-service');
const mc = require('@limit-zero/lm-marketing-cloud');
const actions = require('./actions');

// @todo This should be handled by the json service.
const DEV = process.env.NODE_ENV === 'development';
const handleErrors = fn => async (req, res) => {
  try {
    return await fn(req, res);
  } catch (e) {
    const statusCode = e.statusCode || e.status;
    const obj = { error: true, message: e.message };
    if (DEV) obj.stack = e.stack.split('\n');
    send(res, statusCode || 500, obj);
    // eslint-disable-next-line no-console
    if (e instanceof Error) console.error(e.stack);
    // return null;
  }
};

module.exports = handleErrors(async (req, res) => {
  await mc.client();
  return jsonService({
    actions,
    req,
    res,
    ctx: { mc },
  });
});
