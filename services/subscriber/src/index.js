const { json, createError } = require('micro');
const { invalidParamMsg } = require('@limit-zero/lm-common');
const mc = require('@limit-zero/lm-marketing-cloud');
const actions = require('./actions');

module.exports = async (req, res) => {
  await mc.client();
  const { url } = req;
  if (url === '/_status') return 'OK';
  const input = await json(req);

  const { action, params, meta } = input;
  if (!action) throw createError(400, 'No action provided.');
  const fn = actions[action];
  if (!fn) throw createError(400, invalidParamMsg('action', action, Object.keys(actions)));

  const output = await fn(params || {}, {
    req,
    res,
    meta,
    mc,
  });
  return output || {};
};
