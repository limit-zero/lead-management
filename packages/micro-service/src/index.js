const { json, createError } = require('micro');
const createParamError = require('./param-error');

const jsonService = async ({
  actions = {},
  req,
  res,
  ctx = {},
} = {}) => {
  const { url } = req;
  if (url === '/_status') return 'OK';
  const input = await json(req);
  const { action, params, meta } = input;
  if (!action) throw createError(400, 'No action provided.');

  const fn = actions[action];
  if (typeof fn !== 'function') throw createParamError('action', action, Object.keys(actions));

  const output = await fn(params || {}, {
    req,
    res,
    meta: meta || {},
    ...ctx,
  });
  return output || {};
};

module.exports = {
  jsonService,
  createParamError,
};
