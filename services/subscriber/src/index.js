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
    const { message, stack } = e;
    const status = e.statusCode || e.status || 500;
    const obj = { error: true, status, message };
    if (DEV) obj.stack = stack.split('\n');
    send(res, status, obj);
    // eslint-disable-next-line no-console
    if (e instanceof Error) console.error(`${status} ${stack}`);
    return null;
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
